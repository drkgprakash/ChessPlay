import React, { useState } from 'react';
import { 
  Compass, 
  Puzzle, 
  GraduationCap, 
  Trophy, 
  Building2, 
  Shield, 
  KeyRound, 
  Crown, 
  LogOut,
  Swords,
  Pin,
  PinOff,
  ChevronRight,
  Sparkles,
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { AppModule } from './Header';

interface SidebarProps {
  activeModule: AppModule;
  setActiveModule: (mod: AppModule) => void;
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: AppModule;
  label: string;
  shortLabel?: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  group: 'admin' | 'classroom' | 'play';
  allowedRoles: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  isPinned,
  setIsPinned,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { user, logout, setLoginModalOpen } = useAuth();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [tooltipItem, setTooltipItem] = useState<AppModule | null>(null);

  if (!user) return null;

  const isExpanded = isPinned || isHovered;

  const navItems: NavItem[] = [
    // 1. Management & Platform
    { 
      id: 'owner_overview', 
      label: 'Platform Center', 
      shortLabel: 'Platform',
      icon: Crown, 
      badge: 'Owner',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      group: 'admin', 
      allowedRoles: ['saas_owner'] 
    },
    { 
      id: 'faculty', 
      label: 'Coaches & Staff', 
      shortLabel: 'Faculty',
      icon: Shield, 
      badge: 'Admin',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      group: 'admin', 
      allowedRoles: ['saas_owner', 'academy_admin'] 
    },
    { 
      id: 'academy', 
      label: 'Academy LMS', 
      shortLabel: 'Academy',
      icon: Building2, 
      badge: 'Batches',
      badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      group: 'admin', 
      allowedRoles: ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach'] 
    },

    // 2. Classroom & Competitions
    { 
      id: 'classroom', 
      label: 'Live Classroom', 
      shortLabel: 'Classroom',
      icon: GraduationCap, 
      badge: user.role === 'assistant_coach' ? 'Co-Pilot' : 'Simul 6',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      group: 'classroom', 
      allowedRoles: ['saas_owner', 'academy_admin', 'head_coach', 'assistant_coach'] 
    },
    { 
      id: 'tournaments', 
      label: 'Tournaments', 
      shortLabel: 'Events',
      icon: Trophy, 
      badge: 'Swiss',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      group: 'classroom', 
      allowedRoles: ['saas_owner', 'academy_admin', 'head_coach'] 
    },

    // 3. Engine & Training Studio
    { 
      id: 'analysis', 
      label: 'Analysis Studio', 
      shortLabel: 'Analysis',
      icon: Compass, 
      badge: 'NNUE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      group: 'play', 
      allowedRoles: ['*'] 
    },
    { 
      id: 'puzzles', 
      label: 'Tactics & Puzzles', 
      shortLabel: 'Puzzles',
      icon: Puzzle, 
      badge: '10K+',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      group: 'play', 
      allowedRoles: ['*'] 
    },
    { 
      id: 'play', 
      label: 'Play vs AI & Bots', 
      shortLabel: 'Play',
      icon: Swords, 
      group: 'play', 
      allowedRoles: ['*'] 
    },
  ];

  const visibleNav = navItems.filter(item => 
    item.allowedRoles.includes('*') || item.allowedRoles.includes(user.role)
  );

  const groups: { id: 'admin' | 'classroom' | 'play'; title: string }[] = [
    { id: 'admin', title: 'MANAGEMENT' },
    { id: 'classroom', title: 'INTERACTIVE' },
    { id: 'play', title: 'TRAINING & PLAY' },
  ];

  const handleSelect = (mod: AppModule) => {
    setActiveModule(mod);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTooltipItem(null);
        }}
        className={`fixed top-0 left-0 z-50 h-screen bg-zinc-950/95 backdrop-blur-2xl border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300 ease-out select-none shadow-2xl ${
          // Desktop Width: 72px collapsed -> 256px expanded
          isExpanded ? 'lg:w-64' : 'lg:w-[72px]'
        } ${
          // Mobile translation
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand & Pin Header */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80">
            <div 
              onClick={() => handleSelect(user.role === 'saas_owner' ? 'owner_overview' : 'analysis')}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden"
            >
              {/* Brand Icon */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <span className="text-xl font-black">♞</span>
              </div>

              {/* Expanded Brand Name */}
              <div className={`transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                <div className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Chess<strong className="text-orange-500">Play</strong></span>
                </div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">
                  Academy OS
                </div>
              </div>
            </div>

            {/* Pin / Lock Open Button (Desktop) & Close Button (Mobile) */}
            {isExpanded && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`hidden lg:flex p-1.5 rounded-lg border transition text-xs ${
                    isPinned 
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-800'
                  }`}
                  title={isPinned ? 'Unpin sidebar (auto-collapse on mouse leave)' : 'Pin sidebar expanded'}
                >
                  {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links by Group */}
          <div className="py-4 px-2 space-y-4 overflow-y-auto max-h-[calc(100vh-190px)] scrollbar-none">
            {groups.map((grp) => {
              const items = visibleNav.filter(item => item.group === grp.id);
              if (items.length === 0) return null;

              return (
                <div key={grp.id} className="space-y-1">
                  {/* Group Label when expanded */}
                  {isExpanded && (
                    <div className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase transition-opacity duration-200">
                      {grp.title}
                    </div>
                  )}

                  {/* Items */}
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;

                    return (
                      <div
                        key={item.id}
                        className="relative"
                        onMouseEnter={() => setTooltipItem(item.id)}
                        onMouseLeave={() => setTooltipItem(null)}
                      >
                        <button
                          onClick={() => handleSelect(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent text-white border border-orange-500/30 shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                          }`}
                        >
                          {/* Active Indicator Bar on left */}
                          {isActive && (
                            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-orange-500 to-amber-500" />
                          )}

                          {/* Icon */}
                          <div className={`shrink-0 p-1.5 rounded-lg transition-transform ${
                            isActive 
                              ? 'text-orange-400 bg-orange-500/20 group-hover:scale-110' 
                              : 'text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Text Label (shown when expanded) */}
                          {isExpanded && (
                            <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
                              <span className="truncate font-medium">{item.label}</span>
                              {item.badge && (
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0 ml-1.5 ${item.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Floating Tooltip in Collapsed Mode */}
                        {!isExpanded && tooltipItem === item.id && (
                          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 text-xs text-white shadow-2xl whitespace-nowrap flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                            <span className="font-bold">{item.label}</span>
                            {item.badge && (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                {item.badge}
                              </span>
                            )}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-zinc-900" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom User Area & Quick Role Switch */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/90 space-y-2">
          {/* Quick Role Switcher */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/90 hover:border-zinc-700 text-xs text-zinc-300 transition group ${
              isExpanded ? 'justify-between' : 'justify-center'
            }`}
            title="Switch authenticated role or view permissions"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <KeyRound className="w-3.5 h-3.5 text-orange-400 shrink-0 group-hover:rotate-12 transition-transform" />
              {isExpanded && (
                <div className="text-left truncate">
                  <div className="text-[10px] text-zinc-400 uppercase font-mono font-semibold">Current Role</div>
                  <div className="font-bold text-orange-400 text-xs truncate">
                    {user.role.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              )}
            </div>
            {isExpanded && (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
            )}
          </button>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div 
              onClick={() => setLoginModalOpen(true)}
              className={`flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-90 transition ${
                isExpanded ? 'flex-1' : 'justify-center w-full'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg shadow-inner shrink-0">
                {user.avatar}
              </div>
              {isExpanded && (
                <div className="text-left truncate">
                  <div className="text-xs font-black text-zinc-200 truncate leading-tight">{user.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {user.academyName || 'Platform Owner'}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Action */}
            {isExpanded && (
              <button
                onClick={logout}
                className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition shrink-0"
                title="Sign Out / Lock Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
