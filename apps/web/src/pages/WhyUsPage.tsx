import React from 'react';
import { Check, X, ShieldAlert, Zap, Cpu, Award, Users, HeartHandshake } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface WhyUsPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const WhyUsPage: React.FC<WhyUsPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Competitive Advantage</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
          Why Coaches are Switching to <span className="text-orange-500">Chess Play</span>
        </h1>
        <p className="text-zinc-400 text-base mt-4 leading-relaxed">
          Both ChessPlay.io and Chesslang pioneered parts of online chess teaching, but today’s academies demand modern AI coaching, ultra-fast WebAssembly engines, and friction-free multi-board classrooms.
        </p>
      </div>

      {/* 3 Major Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Zero Server Lag Engine</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Other platforms run heavy Stockfish calculations on congested cloud servers, leading to slow eval bars and frequent timeouts. Chess Play executes <strong>Stockfish 16+ NNUE directly via WebAssembly in browser Web Workers</strong>, delivering instantaneous 3500+ ELO analysis with zero lag.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Revolutionary Simul Grid</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Traditional tools force you to tab back and forth between student screens. Chess Play's patented <strong>Simul Mode</strong> displays a live grid of 6+ student boards simultaneously, so the coach can oversee the entire room with a single glance.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">AI Grandmaster Coach</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Students don't learn from raw centipawn numbers like -1.8. Chess Play translates computer evaluations into human coaching insights, detecting missed tactical motifs (pins, forks, skewers) and explaining why a move is a blunder in plain English.
          </p>
        </div>
      </div>

      {/* Side by Side Comparison Grid */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Detailed Feature-by-Feature Benchmark</h3>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Item 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 items-center">
            <div className="font-bold text-white">
              Chess Engine Power & Latency
            </div>
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Stockfish 16 NNUE WASM (0 Lag)
            </div>
            <div className="text-zinc-500 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-500" /> Competitors: Shared server throttling
            </div>
          </div>

          {/* Item 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 items-center">
            <div className="font-bold text-white">
              Move Quality Badges
            </div>
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Brilliant (!!), Great (!), Best, Blunder (??)
            </div>
            <div className="text-zinc-500 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-500" /> Competitors: None / Basic numbers only
            </div>
          </div>

          {/* Item 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 items-center">
            <div className="font-bold text-white">
              Parent Communication
            </div>
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Automated 1-Click WhatsApp & Email Cards
            </div>
            <div className="text-zinc-500 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-500" /> Competitors: Generic PDF exports
            </div>
          </div>

          {/* Item 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 items-center">
            <div className="font-bold text-white">
              Simul Coaching Grid
            </div>
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Watch 6 student games in real time
            </div>
            <div className="text-zinc-500 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-500" /> Competitors: Single screen only
            </div>
          </div>

          {/* Item 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 items-center">
            <div className="font-bold text-white">
              Tactical Hint Progression
            </div>
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 3-Tier progressive hints (Piece → Square → Move)
            </div>
            <div className="text-zinc-500 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-500" /> Competitors: No hint guidance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
