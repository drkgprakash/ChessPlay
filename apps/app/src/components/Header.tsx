import React from 'react';
import { Bot, Swords, Compass, Puzzle, GraduationCap, Trophy, Building2, Bell, Settings, UserCheck } from 'lucide-react';

export type AppModule = 'play' | 'analysis' | 'puzzles' | 'classroom' | 'tournaments' | 'academy';

interface HeaderProps {
  activeModule: AppModule;
  setActiveModule: (mod: AppModule) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModule, setActiveModule }) => {
  const navItems: { id: AppModule; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'analysis', label: 'Analysis Studio', icon: <Compass className="w-4 h-4" />, badge: 'AI Engine' },
    { id: 'play', label: 'Play vs AI', icon: <Swords className="w-4 h-4" /> },
    { id: 'puzzles', label: 'Puzzles', icon: <Puzzle className="w-4 h-4" /> },
    { id: 'classroom', label: 'Classroom', icon: <GraduationCap className="w-4 h-4" />, badge: 'Simul' },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
    { id: 'academy', label: 'Academy LMS', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveModule('analysis')}>
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
            {navItems.map((item) => (
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

        {/* Right side user info & status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-300 font-medium">Stockfish Engine Ready</span>
          </div>

          <button className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition relative">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1.5 right-1.5" />
          </button>

          {/* Coach User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-sm">
              👨‍🏫
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-zinc-200">Coach Vikram</div>
              <div className="text-[10px] text-zinc-400">Achiever's Academy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-zinc-800/80 gap-1 scrollbar-none">
        {navItems.map((item) => (
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
