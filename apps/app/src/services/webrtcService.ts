// =========================================================
// Chess Play WebRTC Peer-to-Peer AV Engine
// Connects Master Coach & Students for Live Bidirectional Audio/Video
// =========================================================

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

export interface WebRTCSignalPayload {
  target_user_id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_role: string;
  signal_type: 'offer' | 'answer' | 'candidate' | 'stream_ready' | 'stream_ended' | 'stream_status';
  signal_data?: any;
}

export type RemoteStreamCallback = (peerUserId: string, stream: MediaStream, peerRole?: string) => void;
export type StreamStatusCallback = (data: { from_user_id: string; from_user_role?: string; status: any }) => void;

export function normalizeClassroomPeerId(id: string, role?: string): string {
  if (!id) return '';
  const s = String(id).toLowerCase();
  if (
    s === 'coach' || 
    s === 'coach-01' || 
    s === 'usr-headcoach' || 
    s.includes('coach') || 
    role === 'head_coach' || 
    role === 'saas_owner' || 
    role === 'academy_admin'
  ) {
    return 'coach';
  }
  if (s === 'usr-student-01' || s === 'st-1' || s === 'sb-1') return 'st-1';
  if (s === 'usr-student-02' || s === 'st-2' || s === 'sb-2') return 'st-2';
  if (s === 'usr-student-03' || s === 'st-3' || s === 'sb-3') return 'st-3';
  if (s === 'usr-student-04' || s === 'st-4' || s === 'sb-4') return 'st-4';
  if (s === 'usr-student-05' || s === 'st-5' || s === 'sb-5') return 'st-5';
  if (s === 'usr-student-06' || s === 'st-6' || s === 'sb-6') return 'st-6';
  return id;
}

class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private candidateQueue: Map<string, RTCIceCandidateInit[]> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private localStream: MediaStream | null = null;
  private onRemoteStreamCallback: RemoteStreamCallback | null = null;
  private onStreamStatusCallback: StreamStatusCallback | null = null;
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
    this.currentUserId = normalizeClassroomPeerId(userId, userRole);
    this.currentUserName = userName;
    this.currentUserRole = userRole;
    this.sendSignalFn = sendSignal;
    this.onRemoteStreamCallback = onRemoteStream;
  }

  public onStreamStatus(cb: StreamStatusCallback) {
    this.onStreamStatusCallback = cb;
  }

  public async setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    const videoTrack = stream ? stream.getVideoTracks()[0] || null : null;
    const audioTrack = stream ? stream.getAudioTracks()[0] || null : null;

    // Update tracks on all active peer connections
    for (const [normPeerId, pc] of this.peerConnections.entries()) {
      const senders = pc.getSenders();
      const videoSender = senders.find(
        (s) => s.track?.kind === 'video' || pc.getTransceivers().find(t => t.sender === s && (t.receiver.track.kind === 'video' || t.mid === '1' || t.mid === 'video'))
      );
      const audioSender = senders.find(
        (s) => s.track?.kind === 'audio' || pc.getTransceivers().find(t => t.sender === s && (t.receiver.track.kind === 'audio' || t.mid === '0' || t.mid === 'audio'))
      );

      // Handle video track: if paused/null, replaceTrack(null) stops sending video frames cleanly
      if (videoSender) {
        await videoSender.replaceTrack(videoTrack).catch(err => console.warn('replaceTrack video:', err));
      } else if (videoTrack) {
        pc.addTrack(videoTrack, stream!);
      }

      // Handle audio track: if unmuted, replaceTrack(audioTrack) ensures audio continues uninterrupted
      if (audioSender) {
        await audioSender.replaceTrack(audioTrack).catch(err => console.warn('replaceTrack audio:', err));
      } else if (audioTrack) {
        pc.addTrack(audioTrack, stream!);
      }
    }
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Broadcast stream status (camera paused/resumed, mic on/off) in real time
  public async announceStreamStatus(status: { cam_active: boolean; mic_active: boolean; screen_active?: boolean; stream_type?: string }) {
    const payload: WebRTCSignalPayload = {
      target_user_id: 'all',
      from_user_id: this.currentUserId,
      from_user_name: this.currentUserName,
      from_user_role: this.currentUserRole,
      signal_type: 'stream_status',
      signal_data: status
    };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {}
    }

    if (this.sendSignalFn) {
      await this.sendSignalFn(payload).catch(() => {});
    }
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
      await this.sendSignalFn(payload).catch(() => {});
    }
  }

  // Create PeerConnection for a specific remote peer
  private getOrCreatePeerConnection(peerUserId: string, peerRole: string = 'student'): RTCPeerConnection {
    const normPeerId = normalizeClassroomPeerId(peerUserId, peerRole);

    if (this.peerConnections.has(normPeerId)) {
      return this.peerConnections.get(normPeerId)!;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Attach local audio/video tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Ensure bidirectional transceivers are present and ready for 2-way audio/video anytime
    if (pc.getTransceivers().length === 0) {
      pc.addTransceiver('audio', { direction: 'sendrecv' });
      pc.addTransceiver('video', { direction: 'sendrecv' });
    }

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.sendSignalFn) {
        const payload: WebRTCSignalPayload = {
          target_user_id: normPeerId,
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
      let stream = this.remoteStreams.get(normPeerId);
      if (!stream) {
        stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream();
        this.remoteStreams.set(normPeerId, stream);
      }
      if (event.track && !stream.getTracks().includes(event.track)) {
        stream.addTrack(event.track);
      }
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(normPeerId, stream, peerRole);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.peerConnections.delete(normPeerId);
        this.candidateQueue.delete(normPeerId);
      }
    };

    this.peerConnections.set(normPeerId, pc);
    return pc;
  }

  private isCoachRole(role: string): boolean {
    return role === 'head_coach' || role === 'saas_owner' || role === 'academy_admin' || role === 'coach';
  }

  // Drain queued candidates once remote description is set
  private async drainCandidateQueue(normPeerId: string, pc: RTCPeerConnection) {
    const queue = this.candidateQueue.get(normPeerId) || [];
    if (queue.length === 0) return;

    for (const cand of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (e) {
        console.warn('drain candidate error:', e);
      }
    }
    this.candidateQueue.delete(normPeerId);
  }

  // Initiate WebRTC call / offer to peer
  public async callPeer(peerUserId: string, peerRole: string = 'student') {
    const normPeerId = normalizeClassroomPeerId(peerUserId, peerRole);
    if (normPeerId === this.currentUserId) return;

    try {
      const pc = this.getOrCreatePeerConnection(normPeerId, peerRole);
      if (pc.signalingState !== 'stable') {
        console.warn('callPeer skipped: signalingState is', pc.signalingState);
        return;
      }

      // Ensure local tracks are attached
      if (this.localStream) {
        const senders = pc.getSenders();
        this.localStream.getTracks().forEach((track) => {
          const sender = senders.find(s => s.track && s.track.kind === track.kind);
          if (!sender) {
            pc.addTrack(track, this.localStream!);
          }
        });
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      const payload: WebRTCSignalPayload = {
        target_user_id: normPeerId,
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
    if (!signal) return;

    const myNormId = normalizeClassroomPeerId(this.currentUserId, this.currentUserRole);
    const fromNormId = normalizeClassroomPeerId(signal.from_user_id, signal.from_user_role);
    const targetNormId = normalizeClassroomPeerId(signal.target_user_id);

    // Reject self loopback messages
    if (fromNormId === myNormId) return;

    const isCoach = this.isCoachRole(this.currentUserRole);
    const peerRole = signal.from_user_role || 'student';
    const peerIsCoach = this.isCoachRole(peerRole);

    const isTargetMe = 
      signal.target_user_id === 'all' || 
      signal.target_user_id === this.currentUserId ||
      targetNormId === myNormId ||
      (targetNormId === 'coach' && isCoach) ||
      (targetNormId === 'students' && !isCoach);

    if (!isTargetMe) return;

    try {
      if (signal.signal_type === 'stream_ready') {
        // When peer announces stream: initiate call
        if (isCoach) {
          await this.callPeer(fromNormId, peerRole);
        } else if (peerIsCoach) {
          const pc = this.getOrCreatePeerConnection(fromNormId, peerRole);
          if (pc.signalingState === 'stable') {
            await this.callPeer(fromNormId, peerRole);
          }
        }
      } else if (signal.signal_type === 'stream_status' && signal.signal_data) {
        if (this.onStreamStatusCallback) {
          this.onStreamStatusCallback({
            from_user_id: signal.from_user_id,
            from_user_role: signal.from_user_role,
            status: signal.signal_data
          });
        }
      } else if (signal.signal_type === 'offer' && signal.signal_data?.sdp) {
        const pc = this.getOrCreatePeerConnection(fromNormId, peerRole);

        // Attach local tracks before answering so remote peer receives our stream
        if (this.localStream) {
          const senders = pc.getSenders();
          this.localStream.getTracks().forEach((track) => {
            const sender = senders.find(s => s.track && s.track.kind === track.kind);
            if (!sender) {
              pc.addTrack(track, this.localStream!);
            }
          });
        }

        if (pc.signalingState !== 'stable') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.sdp));
          } catch (e) {
            console.warn('setRemoteDescription rollback fallback:', e);
            return;
          }
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.sdp));
        }

        // Drain any ICE candidates received before remote description
        await this.drainCandidateQueue(fromNormId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const payload: WebRTCSignalPayload = {
          target_user_id: fromNormId,
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
        const pc = this.getOrCreatePeerConnection(fromNormId, peerRole);
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.sdp));
          await this.drainCandidateQueue(fromNormId, pc);
        }
      } else if (signal.signal_type === 'candidate' && signal.signal_data) {
        const pc = this.getOrCreatePeerConnection(fromNormId, peerRole);
        if (pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data));
          } catch (e) {
            console.warn('addIceCandidate error:', e);
          }
        } else {
          // Queue candidate until setRemoteDescription completes
          const queue = this.candidateQueue.get(fromNormId) || [];
          queue.push(signal.signal_data);
          this.candidateQueue.set(fromNormId, queue);
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
    this.candidateQueue.clear();
    this.remoteStreams.clear();
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch {}
    }
  }
}

export const webrtcService = new WebRTCManager();
