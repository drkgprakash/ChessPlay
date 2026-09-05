import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, XCircle, Sparkles, TrendingUp, BarChart2 } from 'lucide-react';
import { EvaluatedMove } from '../types/chess';
import { defaultEngine } from '../engine/chessEngine';

interface GameReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  moves: EvaluatedMove[];
}

export const GameReviewModal: React.FC<GameReviewModalProps> = ({ isOpen, onClose, moves }) => {
  if (!isOpen) return null;

  // Compute breakdown stats for White and Black
  const whiteMoves = moves.filter((_, idx) => idx % 2 === 0);
  const blackMoves = moves.filter((_, idx) => idx % 2 === 1);

  const getStats = (playerMoves: EvaluatedMove[]) => {
    const counts = {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      missed_win: 0
    };
    let totalCpLoss = 0;

    for (const m of playerMoves) {
      if (m.classification && counts[m.classification] !== undefined) {
        counts[m.classification]++;
      }
      const loss = Math.max(0, m.evalBefore - m.evalAfter);
      totalCpLoss += loss;
    }

    const avgLoss = playerMoves.length > 0 ? totalCpLoss / playerMoves.length : 0;
    const accuracy = defaultEngine.calculateAccuracy(avgLoss);

    return { counts, accuracy };
  };

  const whiteStats = getStats(whiteMoves);
  const blackStats = getStats(blackMoves);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                Game Review & Accuracy
              </h2>
              <p className="text-xs text-zinc-400">Deep Stockfish AI move classification and performance analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Accuracy Scoreboard */}
          <div className="grid grid-cols-2 gap-4">
            {/* White Accuracy */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">White Accuracy</span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  {whiteStats.accuracy}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-200 border-2 border-orange-500">
                ♔
              </div>
            </div>

            {/* Black Accuracy */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Black Accuracy</span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  {blackStats.accuracy}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center font-bold text-sm text-zinc-400 border-2 border-zinc-700">
                ♚
              </div>
            </div>
          </div>

          {/* Classification Breakdown Table */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
            <div className="grid grid-cols-3 p-3 bg-zinc-800/40 text-xs font-bold text-zinc-400 border-b border-zinc-800">
              <span className="text-left">Classification</span>
              <span className="text-center">White (♔)</span>
              <span className="text-center">Black (♚)</span>
            </div>

            <div className="divide-y divide-zinc-800/50 text-xs font-semibold">
              <div className="grid grid-cols-3 p-2.5 items-center hover:bg-zinc-800/20">
                <span className="flex items-center gap-2 text-cyan-400">
                  <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[9px] flex items-center justify-center font-bold">!!</span>
                  Brilliant
                </span>
                <span className="text-center text-zinc-200">{whiteStats.counts.brilliant}</span>
                <span className="text-center text-zinc-200">{blackStats.counts.brilliant}</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 items-center hover:bg-zinc-800/20">
                <span className="flex items-center gap-2 text-blue-400">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center font-bold">!</span>
                  Great Move
                </span>
                <span className="text-center text-zinc-200">{whiteStats.counts.great}</span>
                <span className="text-center text-zinc-200">{blackStats.counts.great}</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 items-center hover:bg-zinc-800/20">
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">★</span>
                  Best Move
                </span>
                <span className="text-center text-zinc-200">{whiteStats.counts.best}</span>
                <span className="text-center text-zinc-200">{blackStats.counts.best}</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 items-center hover:bg-zinc-800/20">
                <span className="flex items-center gap-2 text-yellow-400">
                  <span className="w-4 h-4 rounded-full bg-yellow-500 text-black text-[9px] flex items-center justify-center font-bold">?!</span>
                  Inaccuracy
                </span>
                <span className="text-center text-zinc-200">{whiteStats.counts.inaccuracy}</span>
                <span className="text-center text-zinc-200">{blackStats.counts.inaccuracy}</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 items-center hover:bg-zinc-800/20">
                <span className="flex items-center gap-2 text-orange-400">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] flex items-center justify-center font-bold">?</span>
                  Mistake
                </span>
                <span className="text-center text-zinc-200">{whiteStats.counts.mistake}</span>
                <span className="text-center text-zinc-200">{blackStats.counts.mistake}</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 items-center hover:bg-zinc-800/20">
                <span className="flex items-center gap-2 text-red-500">
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">??</span>
                  Blunder
                </span>
                <span className="text-center text-zinc-200">{whiteStats.counts.blunder}</span>
                <span className="text-center text-zinc-200">{blackStats.counts.blunder}</span>
              </div>
            </div>
          </div>

          {/* Coach Advice */}
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider">Coach Key Takeaway</h4>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {whiteStats.accuracy > blackStats.accuracy
                  ? 'White maintained superior tactical awareness and converted center control into victory. Black should review the tactical concessions made in the middlegame.'
                  : 'Black navigated the complexities effectively and countered White’s premature pawn pushes. White should focus on king safety and developing minor pieces prior to attacking.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold text-xs text-white transition shadow-lg shadow-orange-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
