import React, { useState } from 'react';
import { KeyRound, Lock, Loader2, AlertCircle, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { DEMO_CREDENTIALS, UserRole } from '../types/auth';

export const AuthPortal: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoSwitch = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    await quickSwitchRole(role);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background Decorative Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl rounded-full" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <span className="text-2xl font-black">♞</span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                Chess<span className="text-orange-500">Play</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition"
            >
              Marketing Website →
            </a>
          </div>
        </div>
      </header>

      {/* Centered Sign In Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xl shadow-inner">
              <Lock className="w-5 h-5 text-orange-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to Chess Play
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Enter your credentials to access your academy portal.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@academy.com"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-400" /> Instant 1-Click Demo Login
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Live JWT</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDemoSwitch(cred.role)}
                  className="p-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/90 border border-zinc-800 text-left transition flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-[11px] font-bold text-zinc-200 group-hover:text-orange-400 transition truncate">
                      {cred.roleTitle.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate">
                      {cred.email}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition flex-shrink-0" />
                </button>
              ))}
            </div>
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
          <div className="flex items-center gap-4 text-zinc-500 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
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
