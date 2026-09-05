import React, { useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle2, MoreVertical, Mail, Phone, Award } from 'lucide-react';
import { useAuth } from '../services/authContext';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'head_coach' | 'assistant_coach';
  avatar: string;
  batches: string[];
  studentsCount: number;
  phone: string;
  joinedDate: string;
  status: 'Active' | 'On Leave';
}

const SAMPLE_COACHES: StaffMember[] = [
  {
    id: 'coach-01',
    name: 'GM Vikram Sen',
    email: 'headcoach@achieverschess.com',
    role: 'head_coach',
    avatar: '👨‍🏫',
    batches: ['Batch Alpha (1400-1800)', 'Master Champions (1800+)'],
    studentsCount: 48,
    phone: '+91 98111 22334',
    joinedDate: 'Jan 2025',
    status: 'Active'
  },
  {
    id: 'coach-02',
    name: 'Pooja Sharma',
    email: 'assistant@achieverschess.com',
    role: 'assistant_coach',
    avatar: '🧑‍🏫',
    batches: ['Batch Alpha (Co-Host)', 'Beginner Knights (800-1200)'],
    studentsCount: 36,
    phone: '+91 98222 33445',
    joinedDate: 'Mar 2025',
    status: 'Active'
  },
  {
    id: 'coach-03',
    name: 'Karan Mehra, FM',
    email: 'karan.fm@achieverschess.com',
    role: 'head_coach',
    avatar: '👨‍💼',
    batches: ['Tactics Mastery', 'Junior League'],
    studentsCount: 42,
    phone: '+91 98333 44556',
    joinedDate: 'Jun 2025',
    status: 'Active'
  }
];

export const CoachStaffModule: React.FC = () => {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<StaffMember[]>(SAMPLE_COACHES);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newCoach, setNewCoach] = useState({
    name: '',
    email: '',
    role: 'head_coach' as 'head_coach' | 'assistant_coach',
    phone: '',
    batch: 'Batch Alpha (1400-1800)'
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const created: StaffMember = {
      id: `coach-0${coaches.length + 1}`,
      name: newCoach.name,
      email: newCoach.email,
      role: newCoach.role,
      avatar: newCoach.role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫',
      batches: [newCoach.batch],
      studentsCount: 0,
      phone: newCoach.phone || '+91 98000 00000',
      joinedDate: 'Just Now',
      status: 'Active'
    };

    setCoaches(prev => [...prev, created]);
    setShowInviteModal(false);
    setNewCoach({ name: '', email: '', role: 'head_coach', phone: '', batch: 'Batch Alpha (1400-1800)' });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Academy Coaches & Faculty Management</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              RBAC Enabled
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Assign distinct permission tiers to your coaching staff. No more sharing the master login!
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-orange-500/25"
        >
          <UserPlus className="w-4 h-4" /> Invite New Coach
        </button>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((c) => (
          <div
            key={c.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl border border-zinc-700">
                    {c.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.role === 'head_coach'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {c.role === 'head_coach' ? 'Head Coach' : 'Assistant Coach'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{c.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Assigned Batches:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {c.batches.map((b, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 font-medium">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 text-[11px]">Students: <strong className="text-zinc-300">{c.studentsCount}</strong></span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Coach Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Invite Faculty Member</h3>
            <p className="text-xs text-zinc-400 mb-4">Send an onboarding invite with distinct role permissions.</p>

            <form onSubmit={handleInvite} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCoach.name}
                  onChange={e => setNewCoach({ ...newCoach, name: e.target.value })}
                  placeholder="e.g. Anand Kumar, FM"
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newCoach.email}
                  onChange={e => setNewCoach({ ...newCoach, email: e.target.value })}
                  placeholder="anand@academy.com"
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Role Permission Tier *</label>
                <select
                  value={newCoach.role}
                  onChange={e => setNewCoach({ ...newCoach, role: e.target.value as 'head_coach' | 'assistant_coach' })}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="head_coach">Head Coach (Master board, simul grid, tournaments)</option>
                  <option value="assistant_coach">Assistant Coach (Co-host, attendance, grading)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Assign Primary Batch</label>
                <input
                  type="text"
                  value={newCoach.batch}
                  onChange={e => setNewCoach({ ...newCoach, batch: e.target.value })}
                  placeholder="e.g. Batch Alpha (1400-1800)"
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-lg shadow-orange-500/20"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
