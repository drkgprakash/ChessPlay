import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { EvalBar } from '../components/EvalBar';
import { MoveHistory } from '../components/MoveHistory';
import { defaultEngine } from '../engine/chessEngine';
import { EvaluatedMove, EngineAnalysisResult } from '../types/chess';
import { sounds } from '../utils/soundEffects';
import { getOpeningFromMoves } from '../data/openings';
import { Bot, User, Flag, RotateCcw, Clock, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BotLevel {
  id: number;
  name: string;
  elo: number;
  depth: number;
  avatar: string;
  description: string;
}

const BOT_LEVELS: BotLevel[] = [
  { id: 1, name: 'Novice Bot', elo: 800, depth: 1, avatar: '🤖', description: 'Beginner friendly, occasionally makes minor inaccuracies.' },
  { id: 2, name: 'Club Player', elo: 1200, depth: 2, avatar: '♟️', description: 'Solid fundamentals, avoids obvious tactical blunders.' },
  { id: 3, name: 'Candidate Master', elo: 1600, depth: 3, avatar: '🛡️', description: 'Aggressive tactical vision and strong center control.' },
  { id: 4, name: 'Grandmaster AI', elo: 2400, depth: 4, avatar: '👑', description: 'Near-flawless calculation, positional mastery.' },
];

export const PlayModule: React.FC = () => {
  const [chess] = useState<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [moves, setMoves] = useState<EvaluatedMove[]>([]);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [botLevel, setBotLevel] = useState<BotLevel>(BOT_LEVELS[1]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [engineAnalysis, setEngineAnalysis] = useState<EngineAnalysisResult | null>(null);

  // Opening detection
  const openingInfo = getOpeningFromMoves(moves.map(m => m.san));

  // Handle player move
  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (gameResult) return;
    if (chess.turn() !== playerColor) return;

    try {
      const evalBefore = defaultEngine.evaluatePosition(chess);
      const move = chess.move({ from, to, promotion });
      if (!move) return;

      // Play appropriate sound
      if (move.captured) {
        sounds.playCapture();
      } else if (move.san.includes('O-O')) {
        sounds.playCastle();
      } else {
        sounds.playMove();
      }

      if (chess.isCheck()) {
        sounds.playCheck();
      }

      const evalAfter = defaultEngine.evaluatePosition(chess);
      const evalMove: EvaluatedMove = {
        san: move.san,
        from,
        to,
        fen: chess.fen(),
        evalBefore,
        evalAfter
      };

      setMoves(prev => [...prev, evalMove]);
      setFen(chess.fen());

      // Check game over
      if (chess.isGameOver()) {
        checkGameOver();
        return;
      }

      // Trigger bot turn
      setTimeout(() => {
        makeBotMove();
      }, 400);
    } catch {
      // Invalid move
    }
  };

  // Bot move logic
  const makeBotMove = () => {
    if (chess.isGameOver()) {
      checkGameOver();
      return;
    }

    setIsBotThinking(true);
    setTimeout(() => {
      const result = defaultEngine.findBestMove(chess, botLevel.depth);
      setEngineAnalysis(result);

      if (result.bestMove) {
        const from = result.bestMove.slice(0, 2) as Square;
        const to = result.bestMove.slice(2, 4) as Square;
        const evalBefore = defaultEngine.evaluatePosition(chess);

        const move = chess.move({ from, to, promotion: 'q' });
        if (move) {
          if (move.captured) {
            sounds.playCapture();
          } else if (move.san.includes('O-O')) {
            sounds.playCastle();
          } else {
            sounds.playMove();
          }

          if (chess.isCheck()) {
            sounds.playCheck();
          }

          const evalAfter = defaultEngine.evaluatePosition(chess);
          setMoves(prev => [
            ...prev,
            {
              san: move.san,
              from,
              to,
              fen: chess.fen(),
              evalBefore,
              evalAfter
            }
          ]);
          setFen(chess.fen());
        }
      }

      setIsBotThinking(false);
      checkGameOver();
    }, 250);
  };

  const checkGameOver = () => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'Black' : 'White';
      setGameResult(`Checkmate! ${winner} wins.`);
      if ((winner === 'White' && playerColor === 'w') || (winner === 'Black' && playerColor === 'b')) {
        sounds.playSuccess();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        sounds.playError();
      }
    } else if (chess.isDraw()) {
      setGameResult('Game drawn by stalemate or insufficient material.');
    }
  };

  const handleReset = () => {
    chess.reset();
    setFen(chess.fen());
    setMoves([]);
    setGameResult(null);
    setEngineAnalysis(null);

    if (playerColor === 'b') {
      setTimeout(() => makeBotMove(), 300);
    }
  };

  const handleResign = () => {
    if (gameResult) return;
    setGameResult(playerColor === 'w' ? 'White resigned. Black wins!' : 'Black resigned. White wins!');
    sounds.playError();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto">
      {/* Left / Center: Board & Player Info */}
      <div className="flex flex-col gap-3 w-full lg:w-auto items-center">
        {/* Opponent Info Card */}
        <div className="w-full max-w-[620px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-xl border border-zinc-700">
              {botLevel.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">{botLevel.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-bold">
                  {botLevel.elo} ELO
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {isBotThinking ? 'Thinking...' : 'Waiting for move'}
              </span>
            </div>
          </div>
          {isBotThinking && (
            <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
              <span className="animate-spin text-sm">⏳</span> Evaluating
            </div>
          )}
        </div>

        {/* Board and Eval Bar Area */}
        <div className="flex gap-3 items-stretch justify-center w-full">
          <div className="h-[380px] sm:h-[480px] md:h-[580px]">
            <EvalBar
              score={engineAnalysis?.score || 0}
              isMate={engineAnalysis?.isMate}
              mateIn={engineAnalysis?.mateIn}
              orientation={playerColor}
            />
          </div>

          <div className="flex-1 max-w-[580px]">
            <ChessBoard
              chess={chess}
              onMove={handlePlayerMove}
              orientation={playerColor}
              interactive={!isBotThinking && !gameResult}
            />
          </div>
        </div>

        {/* Player Info Card */}
        <div className="w-full max-w-[620px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">You (Student)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold">
                  1500 ELO
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {chess.turn() === playerColor ? 'Your turn to move' : 'Opponent turn'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResign}
              disabled={!!gameResult}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-300 text-zinc-400 text-xs font-semibold transition disabled:opacity-40"
            >
              <Flag className="w-3.5 h-3.5" /> Resign
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Game
            </button>
          </div>
        </div>

        {/* Game Result Banner */}
        {gameResult && (
          <div className="w-full max-w-[620px] p-4 rounded-xl bg-gradient-to-r from-orange-900/60 to-zinc-900 border border-orange-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">{gameResult}</h4>
                <p className="text-xs text-zinc-300">Review your moves or start another match.</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Right: Bot Difficulty Settings & Move History */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Opponent Selection */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-orange-400" /> Select AI Opponent
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {BOT_LEVELS.map((bot) => (
              <button
                key={bot.id}
                onClick={() => {
                  setBotLevel(bot);
                  handleReset();
                }}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 ${
                  botLevel.id === bot.id
                    ? 'bg-orange-500/20 border-orange-500/50 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{bot.avatar}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-orange-400">
                    {bot.elo}
                  </span>
                </div>
                <div className="font-bold text-xs text-zinc-200">{bot.name}</div>
              </button>
            ))}
          </div>

          {/* Color Selection */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold">Play as:</span>
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => {
                  setPlayerColor('w');
                  handleReset();
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  playerColor === 'w' ? 'bg-zinc-200 text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ♔ White
              </button>
              <button
                onClick={() => {
                  setPlayerColor('b');
                  handleReset();
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  playerColor === 'b' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ♚ Black
              </button>
            </div>
          </div>
        </div>

        {/* Move History Panel */}
        <div className="h-[420px]">
          <MoveHistory
            moves={moves}
            currentMoveIndex={moves.length - 1}
            onSelectMove={() => {}}
            onFirst={() => {}}
            onPrev={() => {}}
            onNext={() => {}}
            onLast={() => {}}
            onReset={handleReset}
            onFlip={() => setPlayerColor(prev => prev === 'w' ? 'b' : 'w')}
            onExportPGN={() => navigator.clipboard.writeText(chess.pgn())}
            openingInfo={openingInfo}
          />
        </div>
      </div>
    </div>
  );
};
