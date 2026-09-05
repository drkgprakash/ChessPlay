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
  event_type: 'move' | 'fen_reset' | 'arrow_draw' | 'board_lock' | 'student_move' | 'raise_hand' | 'chat_message' | 'simul_reset';
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
  }
};
