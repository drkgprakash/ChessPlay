// =========================================================
// Chess Play Academy Tenants SaaS Management Service
// =========================================================

export interface AcademyTenant {
  id: string;
  name: string;
  slug: string;
  plan_tier: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'suspended';
  monthly_billing: number;
  whatsapp_number?: string;
  contact_email?: string;
  admin_name?: string;
  primary_color?: string;
  coaches_count: number;
  students_count: number;
  batches_count: number;
  created_at: string;
}

export interface PlatformStats {
  total_academies: number;
  active_academies: number;
  total_students: number;
  total_coaches: number;
  total_mrr: number;
  mrr_formatted: string;
}

const API_BASE = '/api/academies.php';

export const academyService = {
  /**
   * Fetch all academy tenants with real-time MySQL stats
   */
  async getAcademies(
    token: string, 
    search?: string
  ): Promise<{ academies: AcademyTenant[]; stats: PlatformStats | null }> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);

      const res = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          academies: data.academies || [],
          stats: data.stats || null
        };
      }
    } catch (err) {
      console.warn('Failed to fetch academy tenants:', err);
    }
    return { academies: [], stats: null };
  },

  /**
   * Register a new academy tenant & provision its admin account
   */
  async createAcademy(
    token: string,
    payload: {
      name: string;
      plan_tier: string;
      monthly_billing: number;
      admin_name: string;
      admin_email: string;
      admin_password: string;
      whatsapp_number?: string;
      primary_color?: string;
    }
  ): Promise<{ success: boolean; message: string; academy_id?: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=create_academy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { 
        success: res.ok && data.status === 'success', 
        message: data.message || 'Failed to create academy tenant',
        academy_id: data.academy_id
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  /**
   * Update academy tenant plan, status, or billing
   */
  async updateAcademy(
    token: string,
    payload: {
      id: string;
      name?: string;
      plan_tier?: string;
      status?: string;
      monthly_billing?: number;
      whatsapp_number?: string;
      primary_color?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=update_academy`, {
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
   * Delete academy tenant and its associated batches and students
   */
  async deleteAcademy(token: string, id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}?action=delete_academy&id=${encodeURIComponent(id)}`, {
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
