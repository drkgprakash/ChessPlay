// =========================================================
// Chess Play Real-Time Classroom Service
// Handles client-server synchronization, master board broadcasts,
// student interactive simul boards, raise-hand & live discussion
// =========================================================

import { ArrowAnnotation } from '../types/chess';

export interface ClassroomSession {
  id: string;
  batch_id: string;
  academy_id: string;
  coach_id: string;
  title: string;
  master_fen: string;
  is_locked: boolean;
  active_arrows: ArrowAnnotation[];
}

export interface StudentBoardState {
  id: string;
  session_id?: string;
  student_id: string;
  student_name: string;
  avatar: string;
  current_fen: string;
  last_move: string | null;
  eval_score: string;
  status: 'active' | 'waiting' | 'solved' | 'blunder';
  hand_raised: boolean | number;
}

export interface ClassroomChatMessage {
  id: number;
  sender: string;
  role?: string;
  text: string;
  time: string;
}

export interface ClassroomSyncEvent {
  id: number;
  user_id: string;
  user_name: string;
  user_role: string;
  event_type: 'move' | 'fen_reset' | 'arrow_draw' | 'board_lock' | 'student_move' | 'raise_hand' | 'chat_message' | 'simul_reset' | 'webrtc_signal' | 'stream_status' | 'pdf_share' | 'pdf_page' | 'pdf_close';
  payload: any;
  created_at: string;
}

export interface ClassroomSnapshotResponse {
  status: string;
  session: ClassroomSession;
  student_boards: StudentBoardState[];
  my_student_id?: string;
  my_board?: StudentBoardState;
  chat_messages: ClassroomChatMessage[];
  last_event_id: number;
  stream_status?: {
    user_id?: string;
    user_name?: string;
    role?: string;
    cam_active?: number | boolean;
    mic_active?: number | boolean;
    screen_active?: number | boolean;
    stream_type?: string;
    isCamStreaming?: boolean;
    isScreenSharing?: boolean;
    streamActive?: boolean;
    streamType?: string;
    coachMicActive?: boolean;
    coachCamActive?: boolean;
  } | null;
  pdf_presentation?: {
    url: string;
    name: string;
    size?: number;
    current_page: number;
    total_pages?: number;
    is_presenting: boolean;
    uploaded_by?: string;
  } | null;
}

export interface ClassroomSyncResponse {
  status: string;
  events: ClassroomSyncEvent[];
  session: ClassroomSession;
  student_boards: StudentBoardState[];
  last_event_id: number;
}

const API_BASE = '/api/classroom_sync.php';

export const classroomService = {
  /**
   * Fetch complete initial room snapshot
   */
  async getSnapshot(batchId: string, token: string): Promise<ClassroomSnapshotResponse | null> {
    try {
      const res = await fetch(`${API_BASE}?action=snapshot&batch_id=${encodeURIComponent(batchId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Classroom snapshot fetch error:', err);
    }
    return null;
  },

  /**
   * Fast polling for new delta events
   */
  async pollSync(batchId: string, sinceId: number, token: string): Promise<ClassroomSyncResponse | null> {
    try {
      const res = await fetch(`${API_BASE}?action=sync&batch_id=${encodeURIComponent(batchId)}&since_id=${sinceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Temporary network jitter
    }
    return null;
  },

  /**
   * Coach broadcasts move on Master Board
   */
  async broadcastMove(batchId: string, fen: string, moveSan: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          event_type: 'move',
          payload: { fen, move: moveSan }
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Coach toggles global board lock
   */
  async broadcastBoardLock(batchId: string, isLocked: boolean, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          event_type: 'board_lock',
          payload: { is_locked: isLocked }
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Coach draws arrows on Master Board
   */
  async broadcastArrows(batchId: string, arrows: ArrowAnnotation[], token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          event_type: 'arrow_draw',
          payload: { arrows }
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Coach broadcasts position to all 6 student simul boards
   */
  async broadcastToSimul(batchId: string, fen: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=broadcast_to_simul`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          fen
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Student or coach submits a move on an individual simul board
   */
  async submitStudentMove(
    batchId: string, 
    studentId: string, 
    fen: string, 
    lastMove: string, 
    evalScore: string, 
    status: string, 
    token: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=student_move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          student_id: studentId,
          fen,
          last_move: lastMove,
          eval_score: evalScore,
          status
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Student raises or lowers hand ✋, or coach lowers it
   */
  async setHandRaised(batchId: string, studentId: string, handRaised: boolean, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=raise_hand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          student_id: studentId,
          hand_raised: handRaised ? 1 : 0
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Send classroom chat message
   */
  async sendChatMessage(batchId: string, text: string, token: string): Promise<ClassroomChatMessage | null> {
    try {
      const res = await fetch(`${API_BASE}?action=chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          text
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.chat || null;
      }
    } catch {
      //
    }
    return null;
  },

  /**
   * Send WebRTC signal payload
   */
  async sendSignal(batchId: string, signal: any, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=signal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          target_user_id: signal.target_user_id,
          from_user_id: signal.from_user_id,
          from_user_name: signal.from_user_name,
          from_user_role: signal.from_user_role,
          signal_type: signal.signal_type,
          signal_data: signal.signal_data
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Broadcast Stream Status
   */
  async broadcastStreamStatus(
    batchId: string,
    camActive: boolean,
    micActive: boolean,
    screenActive: boolean,
    streamType: string,
    token: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}?action=stream_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: batchId,
          user_id: userId,
          cam_active: camActive ? 1 : 0,
          mic_active: micActive ? 1 : 0,
          screen_active: screenActive ? 1 : 0,
          stream_type: streamType
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Upload PDF document for classroom presentation
   */
  async uploadPdf(batchId: string, file: File, token: string | null): Promise<{ status: string; file_url?: string; file_name?: string; pdf_presentation?: any; message?: string }> {
    try {
      const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('chessplay_auth_token') : null);
      const formData = new FormData();
      formData.append('batch_id', batchId);
      formData.append('pdf_file', file);

      const headers: Record<string, string> = {};
      if (effectiveToken) {
        headers['Authorization'] = `Bearer ${effectiveToken}`;
      }

      const res = await fetch(`${API_BASE}?action=upload_pdf&batch_id=${encodeURIComponent(batchId)}`, {
        method: 'POST',
        headers,
        body: formData
      });

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          status: 'error',
          message: res.ok ? 'Unexpected response format from server' : `Server returned error (${res.status}): ${text.slice(0, 120)}`
        };
      }

      if (!res.ok) {
        return { status: 'error', message: json.message || `Upload failed with HTTP ${res.status}` };
      }
      return json;
    } catch (err: any) {
      return { status: 'error', message: err.message || 'Network error while uploading PDF' };
    }
  },

  /**
   * Broadcast current page flip of active PDF presentation
   */
  async broadcastPdfPage(batchId: string, page: number, url: string, name: string, token: string | null): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}?action=pdf_page`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          batch_id: batchId,
          page,
          url,
          name
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Broadcast closing/dismissal of active PDF presentation
   */
  async broadcastPdfClose(batchId: string, token: string | null): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}?action=pdf_close`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          batch_id: batchId
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
