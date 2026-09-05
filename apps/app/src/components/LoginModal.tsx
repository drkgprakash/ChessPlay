import React, { useState } from 'react';
import { X, ShieldCheck, Crown, ArrowRight, Sparkles, Building2, AlertCircle, RotateCcw, Check } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { DEMO_CREDENTIALS, UserRole } from '../types/auth';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, user, token, quickSwitchRole, returnToOwnerRole, isImpersonating } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isLoginModalOpen) return null;

  // Strict Protection: Only Platform Owner (or Owner currently impersonating) can access this modal
  if (user?.role !== 'saas_owner' && !isImpersonating) {
    return null;
  }

  const handleSelectDemo = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    await quickSwitchRole(role);
    setIsSubmitting(false);
  };

  const handleReturnOwner = async () => {
    setError(null);
    setIsSubmitting(true);
    await returnToOwnerRole();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  Owner Role Switcher & Sandbox
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ROOT ONLY
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Inspect platform features, permissions and student/coach UI directly as Platform Owner
              </p>
            </div>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Impersonation Alert Banner if testing as another role */}
          {isImpersonating && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎭</span>
                <div>
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Currently Impersonating
                  </div>
                  <div className="text-xs font-black text-white">
                    {user?.name} <span className="text-amber-400 font-mono text-[11px]">({user?.role.toUpperCase().replace('_', ' ')})</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReturnOwner}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Return to Owner
              </button>
            </div>
          )}

          {/* Active Session Status */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{user?.avatar}</span>
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-2">
                  <span>Current Viewport Persona</span>
                  {token && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      JWT Verified ✓
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {user?.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                    {user?.role.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-mono">{user?.email}</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Roles Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Switch Role & Inspect Dashboard
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Live JWT Session</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_CREDENTIALS.map((cred) => (
                <div
                  key={cred.role}
                  onClick={() => handleSelectDemo(cred.role)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    user?.role === cred.role
                      ? 'bg-purple-500/10 border-purple-500 shadow-md ring-1 ring-purple-500/30'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">
                        {cred.role === 'saas_owner' ? '👑' : cred.role === 'academy_admin' ? '🏛️' : cred.role === 'head_coach' ? '👨‍🏫' : cred.role === 'assistant_coach' ? '🧑‍🏫' : '👦'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cred.role === 'saas_owner'
                            ? 'bg-purple-500/20 text-purple-400'
                            : cred.role === 'academy_admin'
                            ? 'bg-blue-500/20 text-blue-400'
                            : cred.role === 'head_coach'
                            ? 'bg-orange-500/20 text-orange-400'
                            : cred.role === 'assistant_coach'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-yellow-500/20 text-yellow-400'
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
                      <div>{cred.name}</div>
                      <div className="text-zinc-600">{cred.academyName || 'Platform Global'}</div>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className="text-[11px] font-bold text-orange-400 hover:underline flex items-center gap-1"
                    >
                      {user?.role === cred.role ? (
                        <span className="text-purple-400 flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> Active View
                        </span>
                      ) : isSubmitting ? 'Switching...' : 'Switch →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Restricted to SaaS Platform Owner
          </span>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white transition shadow-lg shadow-orange-500/20"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
