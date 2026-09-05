import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, CheckCircle2, User, ArrowRight, Sparkles, Building2, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { DEMO_CREDENTIALS, UserRole } from '../types/auth';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, user, token, quickSwitchRole, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'manual'>('demo');

  if (!isLoginModalOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Invalid email or password. Check credentials or use the 1-Click Demo accounts below.');
    }
  };

  const handleSelectDemo = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    await quickSwitchRole(role);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-orange-950/50 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
              🔐
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Secured Auth & Role-Based Access Control (RBAC)
              </h2>
              <p className="text-xs text-zinc-400">256-Bit Token Authentication & Role-Based Permissions</p>
            </div>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 border-b border-zinc-800 flex items-center gap-4 bg-zinc-950/40">
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Role Switcher (Live JWT)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Secure Email & Password Login
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Session Status */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{user.avatar}</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-2">
                    <span>Current Active Session</span>
                    {token && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        JWT Verified ✓
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {user.name}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold">
                      {user.role.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-zinc-400 font-mono">{user.email}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'demo' ? (
            /* 4 Demo Roles Grid */
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Authenticate Live Role Account
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEMO_CREDENTIALS.map((cred) => (
                  <div
                    key={cred.role}
                    onClick={() => handleSelectDemo(cred.role)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                      user?.role === cred.role
                        ? 'bg-orange-500/10 border-orange-500 shadow-md ring-1 ring-orange-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">
                          {cred.role === 'saas_owner' ? '👑' : cred.role === 'academy_admin' ? '🏛️' : cred.role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cred.role === 'saas_owner'
                              ? 'bg-purple-500/20 text-purple-400'
                              : cred.role === 'academy_admin'
                              ? 'bg-blue-500/20 text-blue-400'
                              : cred.role === 'head_coach'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {cred.badge}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white">{cred.roleTitle}</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{cred.description}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[170px]">
                        <div>{cred.email}</div>
                        <div className="text-zinc-600">PW: {cred.password}</div>
                      </div>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="text-[11px] font-bold text-orange-400 hover:underline flex items-center gap-1"
                      >
                        {user?.role === cred.role ? 'Active ✓' : isSubmitting ? 'Signing...' : 'Sign In →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Manual Email & Password Form */
            <form onSubmit={handleManualLogin} className="space-y-4 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-orange-400" /> Secure Account Authentication
              </h3>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@chessplay.in or admin@achieverschess.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Bcrypt Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Authenticating against Database...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Sign In & Verify JWT
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Permissions Matrix Comparison */}
          <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-950/50">
            <h4 className="text-xs font-bold text-zinc-200 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Permissions for {user?.name || 'Guest'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(user?.permissions || []).map((p) => (
                <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {p === '*' ? '👑 Full Platform Superadmin (*)' : p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted Session
          </span>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white transition shadow-lg shadow-orange-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
