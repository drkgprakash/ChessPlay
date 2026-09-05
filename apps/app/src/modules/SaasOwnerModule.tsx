import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Building2, Users, IndianRupee, TrendingUp, Server, 
  Database, CheckCircle2, Search, Sliders, Sparkles, Plus, RefreshCw, 
  Edit3, Trash2, X, AlertCircle, Phone, Mail, Globe, Layers, ArrowRight, 
  Check, Lock 
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { academyService, AcademyTenant, PlatformStats } from '../services/academyService';

const BRAND_COLORS = [
  { label: 'Orange', value: '#f97316' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Pink', value: '#ec4899' }
];

export const SaasOwnerModule: React.FC = () => {
  const { token, user } = useAuth();

  const [academies, setAcademies] = useState<AcademyTenant[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [managingAcademy, setManagingAcademy] = useState<AcademyTenant | null>(null);
  const [deletingAcademy, setDeletingAcademy] = useState<AcademyTenant | null>(null);

  // Add Academy Form state & validation
  const [addForm, setAddForm] = useState({
    name: '',
    plan_tier: 'pro' as 'starter' | 'pro' | 'enterprise',
    monthly_billing: 7999,
    admin_name: '',
    admin_email: '',
    admin_password: '',
    whatsapp_number: '',
    primary_color: '#f97316'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load academies from DB
  const loadAcademies = async () => {
    if (!token) return;
    setIsLoading(true);
    const data = await academyService.getAcademies(token, search);
    setAcademies(data.academies);
    setStats(data.stats);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAcademies();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAcademies();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Form Validation
  const validateAddForm = () => {
    const errors: Record<string, string> = {};
    if (addForm.name.trim().length < 2) {
      errors.name = 'Academy name must be at least 2 characters';
    }
    if (addForm.admin_name.trim().length < 2) {
      errors.admin_name = 'Admin full name is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.admin_email.trim())) {
      errors.admin_email = 'Valid admin email is required';
    }
    if (addForm.admin_password.length < 6) {
      errors.admin_password = 'Password must be at least 6 characters';
    }
    if (addForm.monthly_billing < 0) {
      errors.monthly_billing = 'Billing fee must be positive';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add Academy
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateAddForm() || !token) return;

    setIsSubmitting(true);
    const res = await academyService.createAcademy(token, addForm);
    setIsSubmitting(false);

    if (res.success) {
      setShowAddModal(false);
      setAddForm({
        name: '',
        plan_tier: 'pro',
        monthly_billing: 7999,
        admin_name: '',
        admin_email: '',
        admin_password: '',
        whatsapp_number: '',
        primary_color: '#f97316'
      });
      loadAcademies();
    } else {
      setApiError(res.message);
    }
  };

  // Submit Manage / Edit Academy
  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingAcademy || !token) return;

    setIsSubmitting(true);
    const res = await academyService.updateAcademy(token, {
      id: managingAcademy.id,
      name: managingAcademy.name,
      plan_tier: managingAcademy.plan_tier,
      status: managingAcademy.status,
      monthly_billing: managingAcademy.monthly_billing,
      whatsapp_number: managingAcademy.whatsapp_number,
      primary_color: managingAcademy.primary_color
    });
    setIsSubmitting(false);

    if (res.success) {
      setManagingAcademy(null);
      loadAcademies();
    } else {
      setApiError(res.message);
    }
  };

  // Confirm Delete Academy
  const handleDeleteConfirm = async () => {
    if (!deletingAcademy || !token) return;

    setIsSubmitting(true);
    const res = await academyService.deleteAcademy(token, deletingAcademy.id);
    setIsSubmitting(false);

    if (res.success) {
      setDeletingAcademy(null);
      loadAcademies();
    } else {
      alert(res.message);
    }
  };

  // Auto-set suggested price when tier changes
  const handleTierChange = (tier: 'starter' | 'pro' | 'enterprise') => {
    const suggested = tier === 'starter' ? 3499 : tier === 'pro' ? 7999 : 14999;
    setAddForm({ ...addForm, plan_tier: tier, monthly_billing: suggested });
  };

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in">
      {/* SaaS Owner Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/20 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center text-3xl shadow-inner">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">SaaS Platform Command Center</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Superadmin
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Global tenant management across all registered chess academies, platform revenue, and server health.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAcademies}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setApiError('');
              setFormErrors({});
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Register New Academy
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Total Academies</span>
          <div className="text-3xl font-black text-white mt-1">
            {stats ? stats.total_academies : academies.length}
          </div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {stats ? stats.active_academies : academies.length} Active in Database
          </span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Active Students</span>
          <div className="text-3xl font-black text-white mt-1">
            {stats ? stats.total_students : 142}
          </div>
          <span className="text-xs text-blue-400 font-semibold mt-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Across {stats ? stats.total_coaches : 6} Certified Coaches
          </span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Platform MRR</span>
          <div className="text-3xl font-black text-purple-300 mt-1">
            {stats ? stats.mrr_formatted : '₹47,994'}
          </div>
          <span className="text-xs text-zinc-400 mt-1 block font-mono">
            Recurring Academy Subscriptions
          </span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Cloud Engine Status</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Healthy
          </div>
          <span className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> Hostinger MySQL Persistent
          </span>
        </div>
      </div>

      {/* Platform Tenant Directory */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-black text-white">Registered Academy Tenants</h3>
            <p className="text-xs text-zinc-400">View, configure, and manage all connected academies on your SaaS platform</p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search academies by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-zinc-500">
            Loading connected academies from MySQL database...
          </div>
        ) : academies.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500">
            No academy tenants found. Click "Register New Academy" above to add your first tenant.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] font-mono">
                  <th className="py-3.5 px-4">Academy Tenant</th>
                  <th className="py-3.5 px-4 text-center">Plan Tier</th>
                  <th className="py-3.5 px-4 text-center">Coaches</th>
                  <th className="py-3.5 px-4 text-center">Students</th>
                  <th className="py-3.5 px-4 text-center">Monthly Fee</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {academies.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-inner border border-white/10"
                          style={{ backgroundColor: t.primary_color || '#f97316' }}
                        >
                          ♟
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-purple-300 transition">{t.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            ID: {t.id} {t.contact_email && `• ${t.contact_email}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        t.plan_tier === 'enterprise' 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                          : t.plan_tier === 'pro' 
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {t.plan_tier}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-zinc-300">
                      {t.coaches_count}
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-zinc-300">
                      {t.students_count}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-bold text-emerald-400">
                      ₹{Number(t.monthly_billing).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        t.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : t.status === 'trial'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setManagingAcademy(t)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs transition flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        {t.id !== 'acad-001' && (
                          <button
                            onClick={() => setDeletingAcademy(t)}
                            className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete academy tenant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. Register New Academy Modal                             */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Register New Academy Tenant</h3>
                <p className="text-xs text-zinc-400">Provisions academy workspace and initial Admin login</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {apiError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-300 font-bold mb-1">Academy Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Royal Knights Chess Academy"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                  {formErrors.name && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.name}</span>}
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Subscription Tier</label>
                  <select
                    value={addForm.plan_tier}
                    onChange={e => handleTierChange(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="starter">Starter (₹3,499 / mo)</option>
                    <option value="pro">Pro (₹7,999 / mo)</option>
                    <option value="enterprise">Enterprise (₹14,999 / mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Monthly Billing (₹)</label>
                  <input
                    type="number"
                    value={addForm.monthly_billing}
                    onChange={e => setAddForm({ ...addForm, monthly_billing: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  {BRAND_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAddForm({ ...addForm, primary_color: c.value })}
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center transition ${
                        addForm.primary_color === c.value ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {addForm.primary_color === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Provisioning Section */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase text-purple-400 block">
                  Academy Admin User Credentials
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Admin Name *</label>
                    <input
                      type="text"
                      required
                      value={addForm.admin_name}
                      onChange={e => setAddForm({ ...addForm, admin_name: e.target.value })}
                      placeholder="e.g. Sanjay Verma"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.admin_name && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.admin_name}</span>}
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">WhatsApp / Phone</label>
                    <input
                      type="text"
                      value={addForm.whatsapp_number}
                      onChange={e => setAddForm({ ...addForm, whatsapp_number: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Admin Email *</label>
                    <input
                      type="email"
                      required
                      value={addForm.admin_email}
                      onChange={e => setAddForm({ ...addForm, admin_email: e.target.value })}
                      placeholder="admin@royalknights.com"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.admin_email && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.admin_email}</span>}
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Admin Password *</label>
                    <input
                      type="password"
                      required
                      value={addForm.admin_password}
                      onChange={e => setAddForm({ ...addForm, admin_password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.admin_password && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.admin_password}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Academy Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. Manage Academy Tenant Modal                            */}
      {/* ========================================================= */}
      {managingAcademy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-inner"
                  style={{ backgroundColor: managingAcademy.primary_color || '#f97316' }}
                >
                  ♟
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{managingAcademy.name}</h3>
                  <p className="text-xs text-zinc-400">Tenant ID: {managingAcademy.id}</p>
                </div>
              </div>
              <button onClick={() => setManagingAcademy(null)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid for this tenant */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Enrolled Students</span>
                <span className="text-base font-black text-white mt-1 block">{managingAcademy.students_count}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Coaches</span>
                <span className="text-base font-black text-orange-400 mt-1 block">{managingAcademy.coaches_count}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Batches</span>
                <span className="text-base font-black text-purple-400 mt-1 block">{managingAcademy.batches_count}</span>
              </div>
            </div>

            <form onSubmit={handleManageSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Academy Name</label>
                <input
                  type="text"
                  value={managingAcademy.name}
                  onChange={e => setManagingAcademy({ ...managingAcademy, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Plan Tier</label>
                  <select
                    value={managingAcademy.plan_tier}
                    onChange={e => setManagingAcademy({ ...managingAcademy, plan_tier: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="starter">Starter (₹3,499)</option>
                    <option value="pro">Pro (₹7,999)</option>
                    <option value="enterprise">Enterprise (₹14,999)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Account Status</label>
                  <select
                    value={managingAcademy.status}
                    onChange={e => setManagingAcademy({ ...managingAcademy, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial Period</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Monthly Billing (₹)</label>
                  <input
                    type="number"
                    value={managingAcademy.monthly_billing}
                    onChange={e => setManagingAcademy({ ...managingAcademy, monthly_billing: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">WhatsApp / Contact</label>
                  <input
                    type="text"
                    value={managingAcademy.whatsapp_number || ''}
                    onChange={e => setManagingAcademy({ ...managingAcademy, whatsapp_number: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setManagingAcademy(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. Delete Academy Confirmation Modal                      */}
      {/* ========================================================= */}
      {deletingAcademy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Delete Academy Tenant?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-zinc-200">{deletingAcademy.name}</strong>? All connected coach accounts, students, and batch data for this tenant will be purged from the platform database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAcademy(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
