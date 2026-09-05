// =========================================================
// Chess Play WebRTC Peer-to-Peer AV Engine
// Connects Master Coach & Students for Live Bidirectional Audio/Video
// =========================================================

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export interface WebRTCSignalPayload {
  target_user_id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_role: string;
  signal_type: 'offer' | 'answer' | 'candidate' | 'stream_ready' | 'stream_ended';
  signal_data?: any;
}

export type RemoteStreamCallback = (peerUserId: string, stream: MediaStream, peerRole?: string) => void;

class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onRemoteStreamCallback: RemoteStreamCallback | null = null;
  private currentUserId: string = '';
  private currentUserName: string = '';
  private currentUserRole: string = '';
  private sendSignalFn: ((signal: WebRTCSignalPayload) => Promise<any>) | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('chessplay_webrtc_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data) {
            this.handleIncomingSignal(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available:', err);
      }
    }
  }

  public init(
    userId: string,
    userName: string,
    userRole: string,
    sendSignal: (signal: WebRTCSignalPayload) => Promise<any>,
    onRemoteStream: RemoteStreamCallback
  ) {
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.currentUserRole = userRole;
    this.sendSignalFn = sendSignal;
    this.onRemoteStreamCallback = onRemoteStream;
  }

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;

    // Update tracks on all active peer connections
    this.peerConnections.forEach((pc) => {
      const senders = pc.getSenders();
      if (stream) {
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track).catch(err => console.warn('replaceTrack:', err));
          } else {
            pc.addTrack(track, stream);
          }
        });
      } else {
        senders.forEach((s) => {
          pc.removeTrack(s);
        });
      }
    });
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Broadcast that this peer is active and ready to stream
  public async announceStreamReady(streamType: 'webcam' | 'screen' = 'webcam') {
    const payload: WebRTCSignalPayload = {
      target_user_id: 'all',
      from_user_id: this.currentUserId,
      from_user_name: this.currentUserName,
      from_user_role: this.currentUserRole,
      signal_type: 'stream_ready',
      signal_data: { streamType }
    };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {}
    }

    if (this.sendSignalFn) {
      await this.sendSignalFn(payload);
    }
  }

  // Create PeerConnection for a specific remote peer
  private getOrCreatePeerConnection(peerUserId: string, peerRole: string = 'student'): RTCPeerConnection {
    if (this.peerConnections.has(peerUserId)) {
      return this.peerConnections.get(peerUserId)!;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Attach local audio/video tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.sendSignalFn) {
        const payload: WebRTCSignalPayload = {
          target_user_id: peerUserId,
          from_user_id: this.currentUserId,
          from_user_name: this.currentUserName,
          from_user_role: this.currentUserRole,
          signal_type: 'candidate',
          signal_data: event.candidate.toJSON()
        };

        if (this.broadcastChannel) {
          try { this.broadcastChannel.postMessage(payload); } catch {}
        }
        this.sendSignalFn(payload).catch(() => {});
      }
    };

    // Handle incoming remote media tracks (Audio + Video)
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(peerUserId, stream, peerRole);
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed' || pc.connectionState === 'disconnected') {
        // Retry or clean up
      }
    };

    this.peerConnections.set(peerUserId, pc);
    return pc;
  }

  private isCoachRole(role: string): boolean {
    return role === 'head_coach' || role === 'saas_owner' || role === 'academy_admin' || role === 'coach';
  }

  // Initiate WebRTC call / offer to peer
  public async callPeer(peerUserId: string, peerRole: string = 'student') {
    if (peerUserId === this.currentUserId) return;

    try {
      const pc = this.getOrCreatePeerConnection(peerUserId, peerRole);
      if (pc.signalingState !== 'stable') {
        console.warn('Cannot create offer, signalingState is:', pc.signalingState);
        return;
      }
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      const payload: WebRTCSignalPayload = {
        target_user_id: peerUserId,
        from_user_id: this.currentUserId,
        from_user_name: this.currentUserName,
        from_user_role: this.currentUserRole,
        signal_type: 'offer',
        signal_data: { sdp: pc.localDescription }
      };

      if (this.broadcastChannel) {
        try { this.broadcastChannel.postMessage(payload); } catch {}
      }

      if (this.sendSignalFn) {
        await this.sendSignalFn(payload);
      }
    } catch (err) {
      console.warn('callPeer error:', err);
    }
  }

  // Handle incoming signaling messages
  public async handleIncomingSignal(signal: WebRTCSignalPayload) {
    if (!signal || signal.from_user_id === this.currentUserId) return;

    const isCoach = this.isCoachRole(this.currentUserRole);
    const peerRole = signal.from_user_role || 'student';
    const peerIsCoach = this.isCoachRole(peerRole);

    const isTargetMe = 
      signal.target_user_id === 'all' || 
      signal.target_user_id === this.currentUserId ||
      (signal.target_user_id === 'coach' && isCoach) ||
      (signal.target_user_id === 'students' && !isCoach);

    if (!isTargetMe) return;

    const peerId = signal.from_user_id;

    try {
      if (signal.signal_type === 'stream_ready') {
        // If other peer is ready: coach connects to student, or student connects to coach
        if (isCoach) {
          await this.callPeer(peerId, peerRole);
        } else if (peerIsCoach) {
          const existing = this.peerConnections.get(peerId);
          if (!existing || existing.connectionState === 'disconnected' || existing.connectionState === 'failed') {
            await this.callPeer(peerId, peerRole);
          }
        }
      } else if (signal.signal_type === 'offer' && signal.signal_data?.sdp) {
        const pc = this.getOrCreatePeerConnection(peerId, peerRole);
        if (pc.signalingState !== 'stable') {
          // Rollback if needed
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.sdp));
          } catch (e) {
            console.warn('setRemoteDescription offer collision fallback:', e);
            return;
          }
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.sdp));
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const payload: WebRTCSignalPayload = {
          target_user_id: peerId,
          from_user_id: this.currentUserId,
          from_user_name: this.currentUserName,
          from_user_role: this.currentUserRole,
          signal_type: 'answer',
          signal_data: { sdp: pc.localDescription }
        };

        if (this.broadcastChannel) {
          try { this.broadcastChannel.postMessage(payload); } catch {}
        }
        if (this.sendSignalFn) {
          await this.sendSignalFn(payload);
        }
      } else if (signal.signal_type === 'answer' && signal.signal_data?.sdp) {
        const pc = this.getOrCreatePeerConnection(peerId, peerRole);
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.sdp));
        }
      } else if (signal.signal_type === 'candidate' && signal.signal_data) {
        const pc = this.getOrCreatePeerConnection(peerId, peerRole);
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data));
        } catch (e) {
          console.warn('addIceCandidate error:', e);
        }
      }
    } catch (err) {
      console.warn('handleIncomingSignal error:', err);
    }
  }

  // Cleanup all connections
  public cleanup() {
    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch {}
    }
  }
}

export const webrtcService = new WebRTCManager();
