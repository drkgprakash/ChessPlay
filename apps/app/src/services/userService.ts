// =========================================================
// Chess Play User & Student Management Service (Real DB)
// =========================================================

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'saas_owner' | 'academy_admin' | 'head_coach' | 'assistant_coach';
  academy_id?: string;
  academy_name?: string;
  avatar_emoji: string;
  phone?: string;
  fide_title?: string;
  rating?: number;
  notes?: string;
  is_active: boolean | number;
  batches: string[];
  created_at?: string;
}

export interface Student {
  id: string;
  academy_id?: string;
  batch_id?: string;
  batch_name?: string;
  batch_schedule?: string;
  batch_level?: string;
  name: string;
  email?: string;
  phone?: string;
  rating: number;
  fide_id?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  attendance_pct: number;
  puzzles_solved: number;
  homework_pct: number;
  status: 'active' | 'inactive' | 'trial' | 'paused';
  notes?: string;
  avatar_emoji: string;
  created_at?: string;
}

export interface Batch {
  id: string;
  name: string;
  coach_id?: string;
  coach_name?: string;
  coach_avatar?: string;
  coach_email?: string;
  schedule: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  max_students: number;
  enrolled_count?: number;
}

const API_BASE = '/api/users.php';


export const userService = {
  /**
   * Fetch all staff members based on caller RBAC
   */
  async getStaff(token: string, search?: string, role?: string): Promise<StaffMember[]> {
    try {
      const params = new URLSearchParams({ type: 'staff' });
      if (search) params.append('q', search);
      if (role) params.append('role', role);

      const res = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.staff || [];
      }
    } catch (err) {
      console.warn('Failed to fetch staff:', err);
    }
    return [];
  },

  /**
   * Create coach or admin staff
   */
  async createStaff(
    token: string, 
    payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      phone?: string;
      fide_title?: string;
      rating?: number;
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string; staff?: StaffMember }> {
    try {
      const res = await fetch(`${API_BASE}?action=create_staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, message: data.message, staff: data.staff };
      }
      return { success: false, message: data.message || 'Failed to create staff member' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Update staff member
   */
  async updateStaff(token: string, payload: Partial<StaffMember>): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=update_staff`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { success: res.ok && data.status === 'success', message: data.message || 'Update failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Delete staff member
   */
  async deleteStaff(token: string, id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=delete_staff&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return { success: res.ok && data.status === 'success', message: data.message || 'Delete failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Fetch students with batch information
   */
  async getStudents(
    token: string, 
    search?: string, 
    batchId?: string
  ): Promise<{ students: Student[]; batches: Batch[] }> {
    try {
      const params = new URLSearchParams({ type: 'students' });
      if (search) params.append('q', search);
      if (batchId) params.append('batch_id', batchId);

      const res = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          students: data.students || [],
          batches: data.batches || []
        };
      }
    } catch (err) {
      console.warn('Failed to fetch students:', err);
    }
    return { students: [], batches: [] };
  },

  /**
   * Create new student
   */
  async createStudent(
    token: string,
    payload: {
      name: string;
      email?: string;
      phone?: string;
      rating?: number;
      fide_id?: string;
      batch_id?: string;
      parent_name?: string;
      parent_phone?: string;
      parent_email?: string;
      notes?: string;
      avatar_emoji?: string;
    }
  ): Promise<{ success: boolean; message: string; student?: Student }> {
    try {
      const res = await fetch(`${API_BASE}?action=create_student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, message: data.message, student: data.student };
      }
      return { success: false, message: data.message || 'Enrollment failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Update student
   */
  async updateStudent(token: string, payload: Partial<Student>): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=update_student`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { success: res.ok && data.status === 'success', message: data.message || 'Update failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Delete student
   */
  async deleteStudent(token: string, id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=delete_student&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return { success: res.ok && data.status === 'success', message: data.message || 'Delete failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Fetch all batches with coach info and enrollment counts
   */
  async getBatches(token: string): Promise<{ batches: Batch[]; coaches: any[] }> {
    try {
      const res = await fetch(`${API_BASE}?type=batches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          batches: data.batches || [],
          coaches: data.coaches || []
        };
      }
    } catch (err) {
      console.warn('Failed to fetch batches:', err);
    }
    return { batches: [], coaches: [] };
  },

  /**
   * Create new batch
   */
  async createBatch(
    token: string,
    payload: {
      name: string;
      coach_id?: string;
      schedule: string;
      level: string;
      max_students: number;
    }
  ): Promise<{ success: boolean; message: string; batch_id?: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=create_batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { success: res.ok && data.status === 'success', message: data.message || 'Batch creation failed', batch_id: data.batch_id };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Update batch
   */
  async updateBatch(
    token: string,
    payload: {
      id: string;
      name?: string;
      coach_id?: string;
      schedule?: string;
      level?: string;
      max_students?: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=update_batch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { success: res.ok && data.status === 'success', message: data.message || 'Update failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Delete batch
   */
  async deleteBatch(token: string, id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=delete_batch&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return { success: res.ok && data.status === 'success', message: data.message || 'Delete failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  }
};

