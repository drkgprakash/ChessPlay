import React from 'react';
import { 
  KeyRound, 
  ChevronDown, 
  LogOut,
  Menu,
  Crown,
  Shield,
  GraduationCap,
  Building2,
  Compass,
  Trophy,
  Puzzle,
  Swords,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../services/authContext';

export type AppModule = 
  | 'owner_overview'
  | 'analysis' 
  | 'play' 
  | 'puzzles' 
  | 'classroom' 
  | 'tournaments' 
  | 'academy'
  | 'faculty';

interface HeaderProps {
  activeModule: AppModule;
  setActiveModule: (mod: AppModule) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const MODULE_META: Record<AppModule, { title: string; subtitle: string; icon: React.FC<{ className?: string }>; badge?: string; badgeColor?: string }> = {
  owner_overview: {
    title: 'Platform Command Center',
    subtitle: 'Global academy tenant oversight, revenue & server health',
    icon: Crown,
    badge: 'Superadmin',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  faculty: {
    title: 'Coaches & Faculty Staff',
    subtitle: 'Faculty rosters, permissions & batch assignments',
    icon: Shield,
    badge: 'Admin',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  classroom: {
    title: 'Live Interactive Masterclass',
    subtitle: 'Batch Alpha • Real-time 2-way board sync & simul radar',
    icon: GraduationCap,
    badge: 'Live Signaling',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  academy: {
    title: 'Academy Management LMS',
    subtitle: 'Batch schedules, student rosters & curriculum progress',
    icon: Building2,
    badge: 'LMS',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700'
  },
  analysis: {
    title: 'Grandmaster Analysis Studio',
    subtitle: 'Stockfish 16+ NNUE engine evaluation & deep tactical review',
    icon: Compass,
    badge: 'NNUE AI',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  tournaments: {
    title: 'Tournament Master Control',
    subtitle: 'FIDE-standard Swiss pairings, leaderboards & round pairings',
    icon: Trophy,
    badge: 'Swiss / Arena',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  puzzles: {
    title: 'Tactics & Endgame Puzzles',
    subtitle: 'Adaptive tactical training library with 10,000+ curated problems',
    icon: Puzzle,
    badge: 'Adaptive',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  play: {
    title: 'Play vs Grandmaster AI',
    subtitle: 'Dynamic personality bots from 800 Elo to 3500+ Stockfish GM',
    icon: Swords,
    badge: 'Custom Bots',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
  }
};

export const Header: React.FC<HeaderProps> = ({ 
  activeModule, 
  setActiveModule,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { user, logout, setLoginModalOpen } = useAuth();

  if (!user) return null;

  const currentMeta = MODULE_META[activeModule] || MODULE_META.classroom;
  const CurrentIcon = currentMeta.icon;

  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Active Module Breadcrumb */}
        <div className="flex items-center gap-3.5">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Module Identity Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/90 items-center justify-center text-orange-400 shadow-inner">
              <CurrentIcon className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight">
                  {currentMeta.title}
                </h1>
                {currentMeta.badge && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentMeta.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {currentMeta.badge}
                  </span>
                )}
              </div>
              <p className="hidden md:block text-[11px] text-zinc-400 mt-0.5">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Operational Status, Role Switcher & User Action */}
        <div className="flex items-center gap-3">
          {/* Edge Network Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800/90 text-[11px] font-mono font-medium text-emerald-400/90 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Edge: 99.99% Operational</span>
          </div>

          {/* Quick Role Switcher Pill */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold transition text-zinc-200 group shadow-sm"
            title="Switch demo account or view role permissions"
          >
            <KeyRound className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline text-zinc-400 font-normal">Role:</span>
            <span className="px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 font-mono text-[10px] font-bold uppercase">
              {user.role.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
          </button>

          {/* User Profile Tile */}
          <div
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-2.5 pl-2.5 border-l border-zinc-800 cursor-pointer hover:opacity-90 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base shadow-sm">
              {user.avatar}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-zinc-200 leading-none">{user.name}</div>
              <div className="text-[10px] text-zinc-400 truncate max-w-[120px] mt-0.5">
                {user.academyName || 'Platform Owner'}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
            title="Sign Out (Lock Session)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
