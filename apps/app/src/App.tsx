import React, { useState, useEffect } from 'react';
import { Header, AppModule } from './components/Header';
import { AnalysisModule } from './modules/AnalysisModule';
import { PlayModule } from './modules/PlayModule';
import { PuzzlesModule } from './modules/PuzzlesModule';
import { ClassroomModule } from './modules/ClassroomModule';
import { TournamentsModule } from './modules/TournamentsModule';
import { AcademyModule } from './modules/AcademyModule';
import { SaasOwnerModule } from './modules/SaasOwnerModule';
import { CoachStaffModule } from './modules/CoachStaffModule';
import { LoginModal } from './components/LoginModal';
import { AuthProvider, useAuth } from './services/authContext';
import { ShieldAlert, KeyRound, Lock, CheckCircle2 } from 'lucide-react';

const AccessDeniedView: React.FC<{ moduleName: string; requiredRole: string }> = ({ moduleName, requiredRole }) => {
  const { user, setLoginModalOpen } = useAuth();

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-zinc-900 border border-red-500/30 shadow-2xl text-center space-y-6 animate-in fade-in">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 text-red-400 flex items-center justify-center text-3xl border border-red-500/20">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-mono">
          RBAC Security Guard • 403 Forbidden
        </span>
        <h2 className="text-2xl font-black text-white mt-3">Access Denied: {moduleName}</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mt-2">
          Your current account role <strong className="text-orange-400 font-mono">{user.role.toUpperCase()}</strong> does not possess the authorization privileges required to access this portal section.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left text-xs font-mono space-y-2">
        <div className="flex justify-between text-zinc-400">
          <span>Required Role:</span>
          <span className="text-emerald-400 font-bold">{requiredRole}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Your Account:</span>
          <span className="text-zinc-200">{user.email}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Active Token:</span>
          <span className="text-orange-400 font-bold">HMAC-SHA256 JWT</span>
        </div>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={() => setLoginModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white transition flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <KeyRound className="w-4 h-4" /> Switch to Authorized Role (Demo Switcher)
        </button>
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { user, canAccessTab } = useAuth();
  const [activeModule, setActiveModule] = useState<AppModule>('owner_overview');

  // Adjust active view if current module is restricted for the selected role
  useEffect(() => {
    if (user.role === 'saas_owner') {
      // Allowed everywhere
    } else if (user.role === 'academy_admin' && activeModule === 'owner_overview') {
      setActiveModule('faculty');
    } else if (user.role === 'head_coach' && (activeModule === 'owner_overview' || activeModule === 'faculty')) {
      setActiveModule('classroom');
    } else if (user.role === 'assistant_coach' && (activeModule === 'owner_overview' || activeModule === 'faculty' || activeModule === 'tournaments')) {
      setActiveModule('classroom');
    }
  }, [user.role]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header activeModule={activeModule} setActiveModule={setActiveModule} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Module Render with RBAC Gates */}
        {activeModule === 'owner_overview' && (
          user.role === 'saas_owner' ? (
            <SaasOwnerModule />
          ) : (
            <AccessDeniedView moduleName="SaaS Platform Superadmin Center" requiredRole="SaaS Owner (Superadmin)" />
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

      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-400">Chess Play SaaS</span>
          <span>•</span>
          <span>Active Role: <strong className="text-orange-400 font-mono uppercase">{user.role.replace('_', ' ')}</strong> ({user.name})</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Lock className="w-3 h-3" /> Secured Auth & RBAC
          </span>
        </div>
        <div>
          <span>Domain: <strong className="text-orange-400">app.chessplay.in</strong> | Marketing: <a href="https://chessplay.in" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white underline">chessplay.in</a></span>
        </div>
      </footer>
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
