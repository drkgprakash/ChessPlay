import React from 'react';
import { 
  Compass, 
  Puzzle, 
  GraduationCap, 
  Trophy, 
  Building2, 
  Shield, 
  KeyRound, 
  Crown, 
  ChevronDown, 
  LogOut,
  Swords
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
}

export const Header: React.FC<HeaderProps> = ({ activeModule, setActiveModule }) => {
  const { user, logout, setLoginModalOpen } = useAuth();

  if (!user) return null;

  // Navigation items strictly filtered by authenticated Role-Based Access
  const allNavItems: { id: AppModule; label: string; icon: React.ReactNode; badge?: string; allowedRoles: string[] }[] = [
    { id: 'owner_overview', label: 'Platform Center', icon: <Crown className="w-3.5 h-3.5 text-purple-400" />, badge: 'Owner', allowedRoles: ['saas_owner'] },
    { id: 'faculty', label: 'Coaches & Staff', icon: <Shield className="w-3.5 h-3.5 text-blue-400" />, badge: 'Admin', allowedRoles: ['saas_owner', 'academy_admin'] },
    { id: 'classroom', label: 'Classroom', icon: <GraduationCap className="w-3.5 h-3.5" />, badge: user.role === 'assistant_coach' ? 'Co-Pilot' : 'Simul', allowedRoles: ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach'] },
    { id: 'academy', label: 'Academy LMS', icon: <Building2 className="w-3.5 h-3.5" />, allowedRoles: ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach'] },
    { id: 'analysis', label: 'Analysis Studio', icon: <Compass className="w-3.5 h-3.5" />, badge: 'AI', allowedRoles: ['*'] },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-3.5 h-3.5" />, allowedRoles: ['saas_owner', 'academy_admin', 'head_coach'] },
    { id: 'puzzles', label: 'Puzzles', icon: <Puzzle className="w-3.5 h-3.5" />, allowedRoles: ['*'] },
    { id: 'play', label: 'Play vs AI', icon: <Swords className="w-3.5 h-3.5" />, allowedRoles: ['*'] },
  ];

  const visibleNav = allNavItems.filter(item => 
    item.allowedRoles.includes('*') || item.allowedRoles.includes(user.role)
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveModule(user.role === 'saas_owner' ? 'owner_overview' : 'analysis')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black">♞</span>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                Chess<span className="text-orange-500">Play</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {visibleNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeModule === item.id
                    ? 'bg-zinc-800/90 text-orange-400 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeModule === item.id ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Controls: Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Button */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold transition text-zinc-200 group shadow-sm"
            title="Switch demo role or view permissions"
          >
            <KeyRound className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline text-zinc-400 font-normal">Role:</span>
            <span className="px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 font-mono text-[10px] font-bold uppercase">
              {user.role.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-2.5 pl-3 border-l border-zinc-800/80 cursor-pointer hover:opacity-90 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-base shadow-sm">
              {user.avatar}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-zinc-200 leading-none">{user.name}</div>
              <div className="text-[10px] text-zinc-500 truncate max-w-[120px] mt-0.5">
                {user.academyName || 'Platform Owner'}
              </div>
            </div>
          </div>

          {/* Dedicated Sign Out / Lock Session Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
            title="Sign Out (Lock Session)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Subnavigation */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-zinc-800/80 gap-1.5 scrollbar-none bg-zinc-950/90">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeModule === item.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
