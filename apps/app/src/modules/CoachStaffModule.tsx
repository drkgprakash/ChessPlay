import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, CheckCircle2, MoreVertical, Mail, Phone, 
  Award, Search, Filter, Trash2, Edit3, X, AlertCircle, Lock, 
  Crown, Sparkles, RefreshCw
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { userService, StaffMember } from '../services/userService';

export const CoachStaffModule: React.FC = () => {
  const { user, token } = useAuth();
  const canManage = user?.role === 'saas_owner' || user?.role === 'academy_admin';

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  // Add Form state & validation
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'head_coach' as 'academy_admin' | 'head_coach' | 'assistant_coach',
    phone: '',
    fide_title: '',
    rating: 1600,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch staff on mount and filter changes
  const loadStaff = async () => {
    if (!token) return;
    setIsLoading(true);
    const data = await userService.getStaff(token, searchQuery, roleFilter);
    setStaff(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, [token, roleFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (addForm.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addForm.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (addForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (addForm.phone && addForm.phone.replace(/[^0-9]/g, '').length < 7) {
      errors.phone = 'Phone number must have at least 7 digits';
    }
    if (addForm.rating < 100 || addForm.rating > 3500) {
      errors.rating = 'Rating must be between 100 and 3500';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add Staff
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateForm() || !token) return;

    setIsSubmitting(true);
    const res = await userService.createStaff(token, addForm);
    setIsSubmitting(false);

    if (res.success) {
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        role: 'head_coach',
        phone: '',
        fide_title: '',
        rating: 1600,
        notes: ''
      });
      loadStaff();
    } else {
      setApiError(res.message);
    }
  };

  // Submit Edit Staff
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !token) return;

    setIsSubmitting(true);
    const res = await userService.updateStaff(token, editingStaff);
    setIsSubmitting(false);

    if (res.success) {
      setEditingStaff(null);
      loadStaff();
    } else {
      setApiError(res.message);
    }
  };

  // Confirm Delete Staff
  const handleDeleteConfirm = async () => {
    if (!deletingStaff || !token) return;

    setIsSubmitting(true);
    const res = await userService.deleteStaff(token, deletingStaff.id);
    setIsSubmitting(false);

    if (res.success) {
      setDeletingStaff(null);
      loadStaff();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-white tracking-tight">Academy Faculty & Staff Roster</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              Live Database
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage head coaches, assistant coaches, and administrative staff permissions across batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStaff}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
            title="Refresh from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {canManage && (
            <button
              onClick={() => {
                setApiError('');
                setFormErrors({});
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition"
            >
              <UserPlus className="w-4 h-4" /> Add Faculty Member
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setRoleFilter('')}
            className={`px-3 py-1.5 rounded-lg transition ${
              roleFilter === '' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('head_coach')}
            className={`px-3 py-1.5 rounded-lg transition ${
              roleFilter === 'head_coach' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Head Coaches
          </button>
          <button
            onClick={() => setRoleFilter('assistant_coach')}
            className={`px-3 py-1.5 rounded-lg transition ${
              roleFilter === 'assistant_coach' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Assistant Coaches
          </button>
          {user?.role === 'saas_owner' && (
            <button
              onClick={() => setRoleFilter('academy_admin')}
              className={`px-3 py-1.5 rounded-lg transition ${
                roleFilter === 'academy_admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Admins
            </button>
          )}
        </div>
      </div>

      {/* Staff Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-500 text-xs font-mono">
          Loading faculty records from database...
        </div>
      ) : staff.length === 0 ? (
        <div className="py-16 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-3">
          <Users className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-300">No faculty members found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search query or role filter.' : 'Click "Add Faculty Member" above to register your first coach.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map((st) => (
            <div
              key={st.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4 hover:border-zinc-700 transition"
            >
              <div>
                {/* Top Role & Status Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      st.role === 'saas_owner'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : st.role === 'academy_admin'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : st.role === 'head_coach'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {st.role.replace('_', ' ').toUpperCase()}
                  </span>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    st.is_active ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 bg-zinc-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.is_active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    {st.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-3.5 mt-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-2xl flex items-center justify-center shadow-inner shrink-0">
                    {st.avatar_emoji || (st.role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫')}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                      {st.name}
                      {st.fide_title && (
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                          {st.fide_title}
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{st.email}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Rating Meta */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Phone</span>
                    <span className="text-zinc-300 truncate block">{st.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Elo Rating</span>
                    <span className="text-orange-400 font-bold block">{st.rating || 1500}</span>
                  </div>
                </div>

                {/* Batches Assigned */}
                <div className="mt-3">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold mb-1">
                    Assigned Batches ({st.batches.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {st.batches.length > 0 ? (
                      st.batches.map((b, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 font-medium">
                          {b}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic">No batches assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Admins */}
              {canManage && (
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingStaff(st)}
                    className="flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Details
                  </button>
                  {st.id !== user?.id && (
                    <button
                      onClick={() => setDeletingStaff(st)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      title="Remove faculty member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* Add Staff Modal                                           */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Enroll New Faculty Member</h3>
                <p className="text-xs text-zinc-400">Creates a persistent account in the database</p>
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
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. GM R. Praggnanandhaa"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
                {formErrors.name && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="coach@academy.com"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  {formErrors.email && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.email}</span>}
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  {formErrors.password && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.password}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Role *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="head_coach">Head Coach</option>
                    <option value="assistant_coach">Assistant Coach</option>
                    {user?.role === 'saas_owner' && <option value="academy_admin">Academy Admin</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  {formErrors.phone && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">FIDE Title</label>
                  <select
                    value={addForm.fide_title}
                    onChange={(e) => setAddForm({ ...addForm, fide_title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">None</option>
                    <option value="GM">GM (Grandmaster)</option>
                    <option value="IM">IM (International Master)</option>
                    <option value="FM">FM (FIDE Master)</option>
                    <option value="CM">CM (Candidate Master)</option>
                    <option value="WGM">WGM (Woman Grandmaster)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">FIDE / Peak Rating</label>
                  <input
                    type="number"
                    value={addForm.rating}
                    onChange={(e) => setAddForm({ ...addForm, rating: parseInt(e.target.value) || 1200 })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Enroll Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Edit Staff Modal                                          */}
      {/* ========================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Edit Faculty: {editingStaff.name}</h3>
                <p className="text-xs text-zinc-400">Update coach profile, contact, and active status</p>
              </div>
              <button onClick={() => setEditingStaff(null)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">FIDE Rating</label>
                  <input
                    type="number"
                    value={editingStaff.rating || 1500}
                    onChange={(e) => setEditingStaff({ ...editingStaff, rating: parseInt(e.target.value) || 1200 })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Status</label>
                <select
                  value={editingStaff.is_active ? '1' : '0'}
                  onChange={(e) => setEditingStaff({ ...editingStaff, is_active: e.target.value === '1' ? 1 : 0 })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive / On Leave</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal                                 */}
      {/* ========================================================= */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Remove Faculty Member?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to remove <strong className="text-zinc-200">{deletingStaff.name}</strong> ({deletingStaff.email}) from the academy database? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingStaff(null)}
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
