// =========================================================
// Chess Play Interactive Homework & Drills Service
// Communicates with /api/homework.php
// =========================================================

export interface HomeworkDrill {
  id: string;
  assignment_id: string;
  order_idx: number;
  title: string;
  theme: string;
  fen: string;
  initial_turn: 'w' | 'b';
  solution_moves: string[];
  hint_piece?: string;
  hint_square?: string;
  hint_solution?: string;
  explanation?: string;
}

export interface HomeworkAssignment {
  id: string;
  academy_id: string;
  batch_id: string;
  batch_name?: string;
  created_by: string;
  coach_name?: string;
  title: string;
  description?: string;
  due_date?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  status: 'active' | 'archived';
  drill_count?: number;
  total_assigned?: number;
  completed_count?: number;
  avg_score?: number;
  drills?: HomeworkDrill[];
  // Student-specific fields
  submission_status?: 'assigned' | 'in_progress' | 'completed' | 'reviewed';
  drills_completed?: number;
  total_drills?: number;
  score_pct?: number;
  coach_feedback?: string;
  submitted_at?: string;
  created_at?: string;
}

export interface HomeworkSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  avatar_emoji?: string;
  rating?: number;
  drills_completed: number;
  total_drills: number;
  score_pct: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'reviewed';
  coach_feedback?: string;
  submitted_at?: string;
  created_at?: string;
}

export interface HomeworkSummaryStats {
  total_assignments: number;
  total_drills: number;
  total_completed_submissions: number;
  global_avg_accuracy: number;
}

export interface BatchOption {
  id: string;
  name: string;
  level: string;
}

export interface HomeworkListResponse {
  status: string;
  role: string;
  assignments: HomeworkAssignment[];
  batches?: BatchOption[];
  stats?: HomeworkSummaryStats;
  student?: any;
}

export interface AssignmentDetailResponse {
  status: string;
  assignment: HomeworkAssignment;
  drills: HomeworkDrill[];
  submissions: HomeworkSubmission[];
}

export interface CreateAssignmentPayload {
  title: string;
  batch_id: string;
  description?: string;
  due_date?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  drills: Array<{
    title: string;
    theme?: string;
    fen: string;
    initial_turn: 'w' | 'b';
    solution_moves: string[];
    hint_piece?: string;
    hint_square?: string;
    hint_solution?: string;
    explanation?: string;
  }>;
}

const API_BASE = '/api/homework.php';

export const homeworkService = {
  /**
   * Fetch all assignments for user's role (coach sees academy batch assignments; student sees personal tasks)
   */
  async getHomeworkList(token: string, batchId?: string): Promise<HomeworkListResponse> {
    try {
      const url = batchId ? `${API_BASE}?batch_id=${encodeURIComponent(batchId)}` : API_BASE;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('Failed to fetch homework list:', err);
      return {
        status: 'error',
        role: 'unknown',
        assignments: []
      };
    }
  },

  /**
   * Fetch detailed assignment with drills and student submissions gradebook
   */
  async getAssignmentDetail(token: string, id: string): Promise<AssignmentDetailResponse | null> {
    try {
      const res = await fetch(`${API_BASE}?action=assignment_detail&id=${encodeURIComponent(id)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch assignment details:', err);
      return null;
    }
  },

  /**
   * Create new batch homework assignment with tactical drills
   */
  async createAssignment(token: string, payload: CreateAssignmentPayload): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=create_assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to create assignment' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error creating assignment' };
    }
  },

  /**
   * Student submits progress / completion for an interactive drill
   */
  async submitDrillProgress(
    token: string, 
    assignmentId: string, 
    drillsCompleted: number, 
    totalDrills: number,
    studentId?: string
  ): Promise<{ success: boolean; scorePct?: number; submissionStatus?: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=submit_drill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          drills_completed: drillsCompleted,
          total_drills: totalDrills,
          student_id: studentId
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return {
          success: true,
          scorePct: data.score_pct,
          submissionStatus: data.submission_status
        };
      }
      return { success: false };
    } catch (err) {
      console.error('Error submitting drill progress:', err);
      return { success: false };
    }
  },

  /**
   * Coach grades student submission or adds written feedback
   */
  async gradeSubmission(
    token: string,
    submissionId: string,
    coachFeedback: string,
    scorePct?: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=grade_submission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submission_id: submissionId,
          coach_feedback: coachFeedback,
          score_pct: scorePct
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to grade submission' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error grading submission' };
    }
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(token: string, id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=delete_assignment&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to delete assignment' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error deleting assignment' };
    }
  }
};
