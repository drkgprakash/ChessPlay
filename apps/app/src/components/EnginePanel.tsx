import React from 'react';
import { Cpu, Zap, Activity, Eye, EyeOff, Bot, Sparkles } from 'lucide-react';
import { EngineAnalysisResult } from '../types/chess';

interface EnginePanelProps {
  analysis: EngineAnalysisResult | null;
  isEvaluating: boolean;
  engineEnabled: boolean;
  onToggleEngine: () => void;
  coachExplanation?: string;
  tacticalMotif?: string;
}

export const EnginePanel: React.FC<EnginePanelProps> = ({
  analysis,
  isEvaluating,
  engineEnabled,
  onToggleEngine,
  coachExplanation,
  tacticalMotif
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
      {/* Header with Switch */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 ${engineEnabled ? 'text-orange-500' : 'text-zinc-500'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Stockfish Engine Evaluation
          </span>
          {isEvaluating && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          )}
        </div>

        <button
          onClick={onToggleEngine}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition ${
            engineEnabled
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {engineEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {engineEnabled ? 'Engine ON' : 'Engine OFF'}
        </button>
      </div>

      {engineEnabled && analysis ? (
        <div className="flex flex-col gap-3">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Depth</div>
              <div className="font-mono font-bold text-zinc-200">{analysis.depth}</div>
            </div>
            <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Nodes</div>
              <div className="font-mono font-bold text-zinc-200">{analysis.nodes.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Speed</div>
              <div className="font-mono font-bold text-zinc-200">{(analysis.nps / 1000).toFixed(0)}k/s</div>
            </div>
          </div>

          {/* Top Lines (Multi-PV) */}
          <div className="space-y-1.5 font-mono text-xs">
            {analysis.multipv?.map((line, idx) => {
              const pawns = (line.score / 100).toFixed(1);
              const scoreStr = line.isMate
                ? line.mateIn ? `M${line.mateIn}` : 'Mate'
                : line.score > 0 ? `+${pawns}` : pawns;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      #{line.rank}
                    </span>
                    <span className="font-bold text-orange-300">{line.bestMoveSan}</span>
                    <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                      {line.pv.slice(1).join(' ')}
                    </span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      line.score > 0
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : line.score < 0
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {scoreStr}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Grandmaster Coach Commentary */}
          {coachExplanation && (
            <div className="bg-gradient-to-br from-orange-950/30 to-zinc-900 border border-orange-500/20 rounded-xl p-3 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Coach Insight
                  </span>
                  {tacticalMotif && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold">
                      {tacticalMotif}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {coachExplanation}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-zinc-500 italic">
          Turn on the engine to calculate real-time evaluation and candidate moves
        </div>
      )}
    </div>
  );
};
