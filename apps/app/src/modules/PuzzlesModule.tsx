import React, { useState } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { PUZZLES } from '../data/puzzles';
import { PuzzleData } from '../types/chess';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Lightbulb, CheckCircle, XCircle, Flame, ArrowRight, RotateCcw, Award, Sparkles } from 'lucide-react';

export const PuzzlesModule: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const puzzle = PUZZLES[currentIdx];
  const [chess, setChess] = useState<Chess>(new Chess(puzzle.fen));
  const [hintStage, setHintStage] = useState<number>(0); // 0 = none, 1 = piece, 2 = square, 3 = solution
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  const handleMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (isSolved) return;

    try {
      const move = chess.move({ from, to, promotion });
      if (!move) return;

      const expectedMoveSan = puzzle.moves[0];

      if (move.san === expectedMoveSan) {
        // Correct move!
        if (move.captured) sounds.playCapture();
        else sounds.playMove();

        sounds.playSuccess();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setIsSolved(true);
        setIsFailed(false);
        setStreak(prev => prev + 1);
        setSolvedCount(prev => prev + 1);
      } else {
        // Incorrect move
        sounds.playError();
        setIsFailed(true);
        setStreak(0);
        // Revert move after slight delay
        setTimeout(() => {
          chess.undo();
          setChess(new Chess(chess.fen()));
        }, 500);
      }
    } catch {
      // Invalid
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (currentIdx + 1) % PUZZLES.length;
    setCurrentIdx(nextIdx);
    const nextPuz = PUZZLES[nextIdx];
    setChess(new Chess(nextPuz.fen));
    setHintStage(0);
    setIsSolved(false);
    setIsFailed(false);
  };

  const handleResetPuzzle = () => {
    setChess(new Chess(puzzle.fen));
    setHintStage(0);
    setIsSolved(false);
    setIsFailed(false);
  };

  const getHintText = () => {
    if (hintStage === 1) return `💡 Hint 1 (Piece): ${puzzle.hints.piece}`;
    if (hintStage === 2) return `💡 Hint 2 (Target): ${puzzle.hints.square}`;
    if (hintStage >= 3) return `💡 Solution: ${puzzle.hints.solution}`;
    return null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto">
      {/* Left: Puzzle Board */}
      <div className="flex flex-col gap-3 w-full lg:w-auto items-center">
        {/* Puzzle Header Bar */}
        <div className="w-full max-w-[580px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
              {puzzle.difficulty}
            </span>
            <h3 className="text-sm font-bold text-zinc-100">{puzzle.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-orange-400">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> {streak} Streak
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-semibold">
              {puzzle.rating} ELO
            </span>
          </div>
        </div>

        {/* Board */}
        <div className="w-full max-w-[580px]">
          <ChessBoard
            chess={chess}
            onMove={handleMove}
            orientation={puzzle.turn}
            interactive={!isSolved}
          />
        </div>

        {/* Turn prompt */}
        <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
          {puzzle.turn === 'w' ? '♔ White to move and win' : '♚ Black to move and win'}
        </div>
      </div>

      {/* Right Column: Hints, Actions, & Stats */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Status Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tactics Challenge</span>
            <span className="text-xs font-bold text-orange-400">
              Puzzle #{currentIdx + 1} of {PUZZLES.length}
            </span>
          </div>

          {/* Success Banner */}
          {isSolved && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Excellent Move! Solved.
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {puzzle.explanation}
              </p>
              <button
                onClick={handleNextPuzzle}
                className="mt-2 w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
              >
                Next Puzzle <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Failure Banner */}
          {isFailed && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <XCircle className="w-4 h-4 text-rose-400" /> Not quite right. Try again!
              </div>
              <button
                onClick={handleResetPuzzle}
                className="text-xs text-rose-200 underline font-semibold hover:text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* Progressive Hint Box */}
          <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-950/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Progressive Hints
              </span>
              <span className="text-[10px] text-zinc-500 font-semibold">Stage {hintStage}/3</span>
            </div>

            {getHintText() ? (
              <p className="text-xs text-yellow-200/90 font-medium bg-yellow-950/30 p-2.5 rounded-lg border border-yellow-500/30 leading-relaxed">
                {getHintText()}
              </p>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Stuck on this position? Unlock progressive coaching hints.
              </p>
            )}

            {!isSolved && (
              <button
                onClick={() => setHintStage(prev => Math.min(prev + 1, 3))}
                disabled={hintStage >= 3}
                className="mt-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                {hintStage === 0 ? 'Get First Hint' : hintStage === 1 ? 'Show Target Square' : 'Show Solution'}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={handleResetPuzzle}
              className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Board
            </button>
            <button
              onClick={handleNextPuzzle}
              className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white transition flex items-center justify-center gap-1 shadow-md shadow-orange-500/20"
            >
              Skip / Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Student Tactical Stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-orange-400" /> Your Training Stats
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-center">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Puzzles Solved</div>
              <div className="text-xl font-black text-white mt-0.5">{solvedCount}</div>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-center">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Current Streak</div>
              <div className="text-xl font-black text-orange-400 mt-0.5">{streak} 🔥</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
