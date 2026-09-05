import React from 'react';
import { Bot, Swords, Compass, Puzzle, GraduationCap, Trophy, Building2, Bell, Shield, KeyRound, Crown, ChevronDown } from 'lucide-react';
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
  const { user, setLoginModalOpen } = useAuth();

  // Navigation items customized by Role-Based Access
  const allNavItems: { id: AppModule; label: string; icon: React.ReactNode; badge?: string; allowedRoles: string[] }[] = [
    { id: 'owner_overview', label: 'Platform Center', icon: <Crown className="w-4 h-4 text-purple-400" />, badge: 'Owner', allowedRoles: ['saas_owner'] },
    { id: 'faculty', label: 'Coaches & Staff', icon: <Shield className="w-4 h-4 text-blue-400" />, badge: 'Admin', allowedRoles: ['saas_owner', 'academy_admin'] },
    { id: 'classroom', label: 'Classroom', icon: <GraduationCap className="w-4 h-4" />, badge: user.role === 'assistant_coach' ? 'Co-Host' : 'Simul', allowedRoles: ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach'] },
    { id: 'academy', label: 'Academy LMS', icon: <Building2 className="w-4 h-4" />, allowedRoles: ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach'] },
    { id: 'analysis', label: 'Analysis Studio', icon: <Compass className="w-4 h-4" />, badge: 'AI', allowedRoles: ['*'] },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" />, allowedRoles: ['saas_owner', 'academy_admin', 'head_coach'] },
    { id: 'puzzles', label: 'Puzzles', icon: <Puzzle className="w-4 h-4" />, allowedRoles: ['*'] },
    { id: 'play', label: 'Play vs AI', icon: <Swords className="w-4 h-4" />, allowedRoles: ['*'] },
  ];

  const visibleNav = allNavItems.filter(item => 
    item.allowedRoles.includes('*') || item.allowedRoles.includes(user.role)
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveModule(user.role === 'saas_owner' ? 'owner_overview' : 'analysis')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <span className="text-xl font-black">♞</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  Chess<span className="text-orange-500">Play</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono font-semibold">
                  app.chessplay.in
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeModule === item.id
                    ? 'bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right side: RBAC Role Switcher & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* 1-Click Role Switcher Trigger */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/15 via-zinc-900 to-zinc-900 border border-orange-500/30 hover:border-orange-500/60 text-xs font-bold transition text-zinc-200 group"
            title="Switch Demo Role (SaaS Owner, Admin, Head Coach, Assistant Coach)"
          >
            <KeyRound className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Switch Role:</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] uppercase">
              {user.role.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {/* User Avatar Badge */}
          <div
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-2 pl-2 border-l border-zinc-800 cursor-pointer hover:opacity-90 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-base">
              {user.avatar}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-zinc-200">{user.name}</div>
              <div className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                {user.academyName || 'Platform Owner'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-zinc-800/80 gap-1 scrollbar-none">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              activeModule === item.id
                ? 'bg-orange-500 text-white shadow'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
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
