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

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<AppModule>('owner_overview');

  // Adjust active view if current module is restricted for the selected role
  useEffect(() => {
    if (user.role === 'saas_owner' && activeModule !== 'owner_overview') {
      // Keep current or owner_overview
    } else if (user.role === 'academy_admin' && activeModule === 'owner_overview') {
      setActiveModule('academy');
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
        {activeModule === 'owner_overview' && <SaasOwnerModule />}
        {activeModule === 'faculty' && <CoachStaffModule />}
        {activeModule === 'analysis' && <AnalysisModule />}
        {activeModule === 'play' && <PlayModule />}
        {activeModule === 'puzzles' && <PuzzlesModule />}
        {activeModule === 'classroom' && <ClassroomModule />}
        {activeModule === 'tournaments' && <TournamentsModule />}
        {activeModule === 'academy' && <AcademyModule />}
      </main>

      <LoginModal />

      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-400">Chess Play SaaS</span>
          <span>•</span>
          <span>Active Role: <strong className="text-orange-400 font-mono uppercase">{user.role.replace('_', ' ')}</strong> ({user.name})</span>
          <span>•</span>
          <span>Database: MySQL (Hostinger)</span>
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
