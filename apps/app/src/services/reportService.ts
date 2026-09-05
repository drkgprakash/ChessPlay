// =========================================================
// Chess Play Student Performance Reports Service
// Communicates with /api/reports.php
// =========================================================

import { Student } from './userService';

export interface StudentReport {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  avatar_emoji?: string;
  fide_id?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  batch_name?: string;
  batch_level?: string;
  academy_id?: string;
  academy_name?: string;
  primary_color?: string;
  coach_id?: string;
  coach_name?: string;
  coach_title?: string;
  period_label: string;
  rating: number;
  rating_change: number;
  attendance_pct: number;
  homework_pct: number;
  puzzles_solved: number;
  overall_grade: string;
  openings_score: number;
  tactics_score: number;
  endgames_score: number;
  time_mgmt_score: number;
  strengths?: string;
  areas_for_growth?: string;
  coach_remarks?: string;
  created_at?: string;
}

export interface StudentReportsResponse {
  status: string;
  student: Student;
  reports: StudentReport[];
  draft: Partial<StudentReport>;
}

const API_BASE = '/api/reports.php';

export const reportService = {
  /**
   * Fetch all report cards and pre-computed draft for a student
   */
  async getStudentReports(token: string, studentId: string): Promise<StudentReportsResponse | null> {
    try {
      const res = await fetch(`${API_BASE}?student_id=${encodeURIComponent(studentId)}`, {
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
      console.error('Failed to fetch student reports:', err);
      return null;
    }
  },

  /**
   * Save / update a student performance report
   */
  async saveReport(
    token: string,
    payload: Partial<StudentReport>
  ): Promise<{ success: boolean; message: string; reportId?: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=generate_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, message: data.message, reportId: data.report_id };
      }
      return { success: false, message: data.message || 'Failed to save report' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error saving report' };
    }
  },

  /**
   * Fetch complete report card detail by report ID
   */
  async getReportDetail(token: string, reportId: string): Promise<StudentReport | null> {
    try {
      const res = await fetch(`${API_BASE}?action=report_detail&id=${encodeURIComponent(reportId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        return data.report;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch report detail:', err);
      return null;
    }
  }
};
