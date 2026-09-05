import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, Sparkles, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { DEMO_CREDENTIALS, UserRole } from '../types/auth';

export const AuthPortal: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'demo' | 'manual'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please check your email and password or use the 1-Click Demo accounts.');
    }
  };

  const handleDemoSelect = async (role: UserRole) => {
    setError(null);
    setLoadingRole(role);
    await quickSwitchRole(role);
    setLoadingRole(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[300px] bg-purple-500/5 blur-3xl rounded-full" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <span className="text-2xl font-black">♞</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  Chess<span className="text-orange-500">Play</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/20">
                  Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition hidden sm:inline"
            >
              Marketing Website →
            </a>
            <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" /> Protected Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col gap-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl shadow-inner">
              🔐
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Chess Play
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Enter your academy credentials or choose a pre-configured demo account to evaluate the platform.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-1 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 grid grid-cols-2 gap-1">
            <button
              onClick={() => { setActiveTab('demo'); setError(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'demo'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Evaluation
            </button>
            <button
              onClick={() => { setActiveTab('manual'); setError(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'manual'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Account Sign In
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'demo' ? (
            /* 1-Click Demo Access Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                  Select Role to Test
                </span>
                <span className="text-[11px] text-orange-400 font-medium">Instant JWT Generation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_CREDENTIALS.map((cred) => {
                  const isLoadingThis = loadingRole === cred.role;
                  return (
                    <div
                      key={cred.role}
                      onClick={() => !loadingRole && handleDemoSelect(cred.role)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between group ${
                        cred.role === 'saas_owner'
                          ? 'bg-zinc-950/60 border-purple-500/30 hover:border-purple-500 hover:bg-purple-950/20'
                          : cred.role === 'academy_admin'
                          ? 'bg-zinc-950/60 border-blue-500/30 hover:border-blue-500 hover:bg-blue-950/20'
                          : cred.role === 'head_coach'
                          ? 'bg-zinc-950/60 border-orange-500/30 hover:border-orange-500 hover:bg-orange-950/20'
                          : 'bg-zinc-950/60 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-950/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">
                            {cred.role === 'saas_owner' ? '👑' : cred.role === 'academy_admin' ? '🏛️' : cred.role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              cred.role === 'saas_owner'
                                ? 'bg-purple-500/20 text-purple-300'
                                : cred.role === 'academy_admin'
                                ? 'bg-blue-500/20 text-blue-300'
                                : cred.role === 'head_coach'
                                ? 'bg-orange-500/20 text-orange-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {cred.badge}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition">
                          {cred.roleTitle}
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                          {cred.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">
                          {cred.email}
                        </span>
                        <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          {isLoadingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>Enter →</>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Manual Email & Password Form */
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@youracademy.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">Password</label>
                  <span className="text-[11px] text-zinc-500">Encrypted transmission</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/25 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Sign In to Portal
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security & Feature Badges */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Protection
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" /> Role-Based Access Control
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Stockfish 16+ NNUE
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">ChessPlay Platform</span>
            <span>•</span>
            <span>Enterprise Chess Academy Operating System</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <span>•</span>
            <span>© 2026 Chess Play Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
