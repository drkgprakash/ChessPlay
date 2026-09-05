import React, { useState, useEffect } from 'react';
import { Header, AppModule } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AnalysisModule } from './modules/AnalysisModule';
import { PlayModule } from './modules/PlayModule';
import { PuzzlesModule } from './modules/PuzzlesModule';
import { ClassroomModule } from './modules/ClassroomModule';
import { TournamentsModule } from './modules/TournamentsModule';
import { AcademyModule } from './modules/AcademyModule';
import { SaasOwnerModule } from './modules/SaasOwnerModule';
import { CoachStaffModule } from './modules/CoachStaffModule';
import { HomeworkModule } from './modules/HomeworkModule';
import { LoginModal } from './components/LoginModal';
import { AuthPortal } from './components/AuthPortal';
import { AuthProvider, useAuth } from './services/authContext';
import { ShieldAlert, KeyRound, Lock, Loader2 } from 'lucide-react';

const AccessDeniedView: React.FC<{ moduleName: string; requiredRole: string }> = ({ moduleName, requiredRole }) => {
  const { user, setLoginModalOpen, logout } = useAuth();

  return (
    <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-zinc-900/90 border border-red-500/30 shadow-2xl text-center space-y-6 animate-in fade-in">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 text-red-400 flex items-center justify-center text-3xl border border-red-500/20 shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-mono">
          Security Guard • 403 Forbidden
        </span>
        <h2 className="text-2xl font-black text-white mt-3">Access Restricted: {moduleName}</h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
          Your current account role <strong className="text-orange-400 font-mono">{user?.role.toUpperCase()}</strong> does not possess the administrative privileges required to access this portal section.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-left text-xs font-mono space-y-2">
        <div className="flex justify-between text-zinc-400">
          <span>Required Role:</span>
          <span className="text-emerald-400 font-bold">{requiredRole}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Your Account:</span>
          <span className="text-zinc-200">{user?.email}</span>
        </div>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        {user?.role === 'saas_owner' ? (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white transition flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <KeyRound className="w-4 h-4" /> Owner Sandbox: Switch Role
          </button>
        ) : (
          <button
            onClick={logout}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-bold text-xs text-white transition flex items-center gap-2 shadow-md"
          >
            <Lock className="w-4 h-4" /> Sign Out & Switch Account
          </button>
        )}
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeModule, setActiveModule] = useState<AppModule>('classroom');
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem('chessplay_sidebar_pinned') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('chessplay_sidebar_pinned', isPinned ? 'true' : 'false');
  }, [isPinned]);

  // Adjust default landing view based on authenticated role
  useEffect(() => {
    if (!user) return;
    if (user.role === 'saas_owner') {
      setActiveModule('owner_overview');
    } else if (user.role === 'academy_admin') {
      setActiveModule('faculty');
    } else if (user.role === 'head_coach' || user.role === 'assistant_coach') {
      setActiveModule('classroom');
    } else if (user.role === 'student') {
      setActiveModule('homework');
    }
  }, [user?.role]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center text-3xl animate-pulse shadow-lg shadow-orange-500/10">
          ♞
        </div>
        <div className="text-xs font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-2 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-orange-400" /> Initializing Chess Play...
        </div>
      </div>
    );
  }

  // Protected Gate: If unauthenticated, show AuthPortal
  if (!user) {
    return <AuthPortal />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Collapsible Luxury Sidebar with Hover Expansion */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main App Viewport */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out ${
        isPinned ? 'lg:pl-64' : 'lg:pl-[72px]'
      }`}>
        <Header 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeModule === 'owner_overview' && (
            user.role === 'saas_owner' ? (
              <SaasOwnerModule />
            ) : (
              <AccessDeniedView moduleName="SaaS Platform Command Center" requiredRole="SaaS Owner (Superadmin)" />
            )
          )}

          {activeModule === 'faculty' && (
            user.role === 'saas_owner' || user.role === 'academy_admin' ? (
              <CoachStaffModule />
            ) : (
              <AccessDeniedView moduleName="Coaches & Staff Management" requiredRole="Academy Admin or SaaS Owner" />
            )
          )}

          {activeModule === 'analysis' && <AnalysisModule />}
          {activeModule === 'play' && <PlayModule />}
          {activeModule === 'puzzles' && <PuzzlesModule />}
          {activeModule === 'classroom' && <ClassroomModule />}
          {activeModule === 'homework' && <HomeworkModule />}
          
          {activeModule === 'tournaments' && (
            user.role !== 'assistant_coach' ? (
              <TournamentsModule />
            ) : (
              <AccessDeniedView moduleName="Tournament Master Control" requiredRole="Head Coach, Academy Admin or SaaS Owner" />
            )
          )}

          {activeModule === 'academy' && <AcademyModule />}
        </main>

        <LoginModal />

        {/* Enterprise SaaS Footer */}
        <footer className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-orange-500/15 flex items-center justify-center text-orange-400 text-xs font-black">
                ♞
              </div>
              <span className="font-bold text-zinc-300">ChessPlay</span>
              <span>•</span>
              <span className="text-zinc-500">Enterprise Chess Academy Operating System</span>
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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;

