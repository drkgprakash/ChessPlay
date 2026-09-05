import React, { useState } from 'react';
import { Header, AppModule } from './components/Header';
import { AnalysisModule } from './modules/AnalysisModule';
import { PlayModule } from './modules/PlayModule';
import { PuzzlesModule } from './modules/PuzzlesModule';
import { ClassroomModule } from './modules/ClassroomModule';
import { TournamentsModule } from './modules/TournamentsModule';
import { AcademyModule } from './modules/AcademyModule';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<AppModule>('analysis');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header activeModule={activeModule} setActiveModule={setActiveModule} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {activeModule === 'analysis' && <AnalysisModule />}
        {activeModule === 'play' && <PlayModule />}
        {activeModule === 'puzzles' && <PuzzlesModule />}
        {activeModule === 'classroom' && <ClassroomModule />}
        {activeModule === 'tournaments' && <TournamentsModule />}
        {activeModule === 'academy' && <AcademyModule />}
      </main>

      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-400">Chess Play SaaS</span>
          <span>•</span>
          <span>Stockfish 16+ NNUE Engine</span>
          <span>•</span>
          <span>Hostinger Business Cloud Optimized</span>
        </div>
        <div>
          <span>Domain: <strong className="text-orange-400">app.chessplay.in</strong> | Marketing: <a href="https://chessplay.in" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white underline">chessplay.in</a></span>
        </div>
      </footer>
    </div>
  );
};

export default App;
