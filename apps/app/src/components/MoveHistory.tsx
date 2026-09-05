import React from 'react';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, RotateCcw, Share2, Sparkles, AlertTriangle, XCircle, CheckCircle2, Award } from 'lucide-react';
import { EvaluatedMove, MoveClassification } from '../types/chess';

interface MoveHistoryProps {
  moves: EvaluatedMove[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onReset: () => void;
  onFlip: () => void;
  onExportPGN: () => void;
  openingInfo?: { eco: string; name: string } | null;
}

const getClassificationIcon = (cls?: MoveClassification) => {
  switch (cls) {
    case 'brilliant':
      return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 text-[9px] font-black text-black" title="Brilliant (!!)">!!</span>;
    case 'great':
      return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-[9px] font-black text-white" title="Great (!)">!</span>;
    case 'best':
      return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-black text-white" title="Best">★</span>;
    case 'inaccuracy':
      return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500 text-[9px] font-black text-black" title="Inaccuracy (?!)">?!</span>;
    case 'mistake':
      return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-[9px] font-black text-white" title="Mistake (?)">?</span>;
    case 'blunder':
      return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-[9px] font-black text-white" title="Blunder (??)">??</span>;
    case 'missed_win':
      return <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-700 text-[9px] font-black text-white" title="Missed Win">✕</span>;
    default:
      return null;
  }
};

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onReset,
  onFlip,
  onExportPGN,
  openingInfo
}) => {
  // Group moves into pairs (White & Black)
  const movePairs: { turnNum: number; white?: EvaluatedMove; black?: EvaluatedMove; whiteIdx: number; blackIdx: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      turnNum: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
      whiteIdx: i,
      blackIdx: i + 1
    });
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
      {/* Opening Header */}
      <div className="px-4 py-3 bg-zinc-800/70 border-b border-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Award className="w-4 h-4 text-orange-400 shrink-0" />
          <div className="truncate text-xs font-semibold text-zinc-200">
            {openingInfo ? (
              <span>
                <span className="text-orange-400 font-mono mr-1">[{openingInfo.eco}]</span>
                {openingInfo.name}
              </span>
            ) : (
              <span className="text-zinc-400 italic">Standard Starting Position</span>
            )}
          </div>
        </div>
        <button
          onClick={onExportPGN}
          title="Export PGN"
          className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-700 transition"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Move List Table */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs divide-y divide-zinc-800/50">
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 italic">
            Make a move to begin recording notation
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.turnNum} className="grid grid-cols-12 py-1 items-center hover:bg-zinc-800/40 rounded px-1">
              <span className="col-span-2 text-zinc-500 font-bold">{pair.turnNum}.</span>

              {/* White Move */}
              <button
                onClick={() => onSelectMove(pair.whiteIdx)}
                className={`col-span-5 flex items-center justify-between px-2 py-0.5 rounded text-left transition ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40'
                    : 'text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span>{pair.white?.san}</span>
                {getClassificationIcon(pair.white?.classification)}
              </button>

              {/* Black Move */}
              {pair.black ? (
                <button
                  onClick={() => onSelectMove(pair.blackIdx)}
                  className={`col-span-5 flex items-center justify-between px-2 py-0.5 rounded text-left transition ${
                    currentMoveIndex === pair.blackIdx
                      ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40'
                      : 'text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span>{pair.black.san}</span>
                  {getClassificationIcon(pair.black.classification)}
                </button>
              ) : (
                <span className="col-span-5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Controls Footer */}
      <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onFirst}
            disabled={moves.length === 0 || currentMoveIndex < 0}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition"
            title="Start of Game"
          >
            <ChevronFirst className="w-4 h-4" />
          </button>
          <button
            onClick={onPrev}
            disabled={moves.length === 0 || currentMoveIndex < 0}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition"
            title="Previous Move"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={moves.length === 0 || currentMoveIndex >= moves.length - 1}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition"
            title="Next Move"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLast}
            disabled={moves.length === 0 || currentMoveIndex >= moves.length - 1}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition"
            title="Current Position"
          >
            <ChevronLast className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFlip}
            className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition font-sans font-medium"
            title="Flip Board"
          >
            Flip
          </button>
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/50 hover:text-red-400 text-zinc-400 transition"
            title="New Game / Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
