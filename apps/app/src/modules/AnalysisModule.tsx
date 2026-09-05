import React, { useState, useEffect } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { EvalBar } from '../components/EvalBar';
import { MoveHistory } from '../components/MoveHistory';
import { EnginePanel } from '../components/EnginePanel';
import { GameReviewModal } from '../components/GameReviewModal';
import { defaultEngine } from '../engine/chessEngine';
import { EvaluatedMove, EngineAnalysisResult, ArrowAnnotation, SquareHighlight } from '../types/chess';
import { sounds } from '../utils/soundEffects';
import { getOpeningFromMoves } from '../data/openings';
import { Award, FileText, Upload, Sparkles, SlidersHorizontal, BookOpen } from 'lucide-react';

export const AnalysisModule: React.FC = () => {
  const [chess] = useState<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [moves, setMoves] = useState<EvaluatedMove[]>([]);
  const [currentMoveIdx, setCurrentMoveIdx] = useState<number>(-1);
  const [orientation, setOrientation] = useState<'w' | 'b'>('w');
  const [engineEnabled, setEngineEnabled] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<EngineAnalysisResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showFenModal, setShowFenModal] = useState<boolean>(false);
  const [fenInput, setFenInput] = useState<string>('');

  // Right click annotations
  const [arrows, setArrows] = useState<ArrowAnnotation[]>([]);
  const [highlights, setHighlights] = useState<SquareHighlight[]>([]);

  // Opening detection
  const openingInfo = getOpeningFromMoves(moves.map(m => m.san));

  // Run engine analysis whenever FEN changes
  useEffect(() => {
    if (!engineEnabled) {
      setAnalysis(null);
      return;
    }

    setIsEvaluating(true);
    const timer = setTimeout(() => {
      const result = defaultEngine.findBestMove(chess, 3);
      setAnalysis(result);
      setIsEvaluating(false);

      // Add best move arrow
      if (result.bestMove && result.bestMove.length >= 4) {
        const from = result.bestMove.slice(0, 2) as Square;
        const to = result.bestMove.slice(2, 4) as Square;
        setArrows([{ from, to, color: 'green' }]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [fen, engineEnabled]);

  const handleMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    try {
      const evalBefore = defaultEngine.evaluatePosition(chess);
      const move = chess.move({ from, to, promotion });
      if (!move) return;

      if (move.captured) sounds.playCapture();
      else if (move.san.includes('O-O')) sounds.playCastle();
      else sounds.playMove();

      if (chess.isCheck()) sounds.playCheck();

      const evalAfter = defaultEngine.evaluatePosition(chess);
      const topMove = analysis?.bestMoveSan || move.san;
      const { classification, explanation, motif } = defaultEngine.classifyMove(
        new Chess(chess.fen()),
        move.san,
        evalBefore,
        evalAfter,
        topMove
      );

      const newEvalMove: EvaluatedMove = {
        san: move.san,
        from,
        to,
        fen: chess.fen(),
        evalBefore,
        evalAfter,
        bestMoveSan: topMove,
        classification,
        explanation,
        tacticalMotif: motif
      };

      const updated = [...moves.slice(0, currentMoveIdx + 1), newEvalMove];
      setMoves(updated);
      setCurrentMoveIdx(updated.length - 1);
      setFen(chess.fen());
      setHighlights([]);
    } catch {
      // Invalid
    }
  };

  const goToMove = (index: number) => {
    if (index < -1 || index >= moves.length) return;

    chess.reset();
    for (let i = 0; i <= index; i++) {
      chess.move(moves[i].san);
    }
    setCurrentMoveIdx(index);
    setFen(chess.fen());
    setArrows([]);
    setHighlights([]);
  };

  const handleLoadFen = () => {
    try {
      const test = new Chess(fenInput.trim());
      chess.load(fenInput.trim());
      setFen(chess.fen());
      setMoves([]);
      setCurrentMoveIdx(-1);
      setShowFenModal(false);
      setFenInput('');
    } catch {
      alert('Invalid FEN string');
    }
  };

  const handleLoadPGN = (pgnString: string) => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgnString);
      const pgnMoves = newGame.history({ verbose: true });

      chess.reset();
      const evaluatedList: EvaluatedMove[] = [];

      for (const m of pgnMoves) {
        const evalBefore = defaultEngine.evaluatePosition(chess);
        const performed = chess.move(m.san);
        const evalAfter = defaultEngine.evaluatePosition(chess);
        const topMove = m.san;
        const { classification, explanation, motif } = defaultEngine.classifyMove(
          new Chess(chess.fen()),
          m.san,
          evalBefore,
          evalAfter,
          topMove
        );

        evaluatedList.push({
          san: m.san,
          from: m.from,
          to: m.to,
          fen: chess.fen(),
          evalBefore,
          evalAfter,
          bestMoveSan: topMove,
          classification,
          explanation,
          tacticalMotif: motif
        });
      }

      setMoves(evaluatedList);
      setCurrentMoveIdx(evaluatedList.length - 1);
      setFen(chess.fen());
      setShowFenModal(false);
    } catch {
      alert('Could not parse PGN text');
    }
  };

  // Sample famous game: Kasparov vs Topalov (Immortal)
  const loadSampleGame = () => {
    const sample = `1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5`;
    handleLoadPGN(sample);
  };

  const currentMoveData = currentMoveIdx >= 0 ? moves[currentMoveIdx] : undefined;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto">
      {/* Left: Board and Evaluation */}
      <div className="flex flex-col gap-3 w-full lg:w-auto items-center">
        {/* Quick Toolbar */}
        <div className="w-full max-w-[620px] flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">Analysis Studio</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              Stockfish 16 NNUE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFenModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition"
            >
              <Upload className="w-3.5 h-3.5 text-orange-400" /> FEN / PGN
            </button>
            <button
              onClick={loadSampleGame}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-400" /> Famous Game
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              disabled={moves.length === 0}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-sm disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" /> Game Review
            </button>
          </div>
        </div>

        {/* Board & Eval Bar */}
        <div className="flex gap-3 items-stretch justify-center w-full">
          <div className="h-[380px] sm:h-[480px] md:h-[580px]">
            <EvalBar
              score={analysis?.score || 0}
              isMate={analysis?.isMate}
              mateIn={analysis?.mateIn}
              orientation={orientation}
            />
          </div>

          <div className="flex-1 max-w-[580px]">
            <ChessBoard
              chess={chess}
              onMove={handleMove}
              orientation={orientation}
              interactive={true}
              arrows={arrows}
              highlights={highlights}
              onAddArrow={(a) => setArrows(prev => [...prev, a])}
              onAddHighlight={(h) => setHighlights(prev => [...prev, h])}
              onClearAnnotations={() => {
                setArrows([]);
                setHighlights([]);
              }}
            />
          </div>
        </div>

        {/* Annotation tip */}
        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
          <span>💡 <strong className="text-zinc-400">Right-click & drag</strong> to draw tactical arrows. Right-click to highlight squares.</span>
        </div>
      </div>

      {/* Right Column: Move History & Engine Evaluation Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Engine Panel */}
        <EnginePanel
          analysis={analysis}
          isEvaluating={isEvaluating}
          engineEnabled={engineEnabled}
          onToggleEngine={() => setEngineEnabled(prev => !prev)}
          coachExplanation={currentMoveData?.explanation}
          tacticalMotif={currentMoveData?.tacticalMotif}
        />

        {/* Move History */}
        <div className="h-[380px]">
          <MoveHistory
            moves={moves}
            currentMoveIndex={currentMoveIdx}
            onSelectMove={(idx) => goToMove(idx)}
            onFirst={() => goToMove(-1)}
            onPrev={() => goToMove(currentMoveIdx - 1)}
            onNext={() => goToMove(currentMoveIdx + 1)}
            onLast={() => goToMove(moves.length - 1)}
            onReset={() => {
              chess.reset();
              setFen(chess.fen());
              setMoves([]);
              setCurrentMoveIdx(-1);
              setArrows([]);
              setHighlights([]);
            }}
            onFlip={() => setOrientation(prev => prev === 'w' ? 'b' : 'w')}
            onExportPGN={() => navigator.clipboard.writeText(chess.pgn())}
            openingInfo={openingInfo}
          />
        </div>
      </div>

      {/* Review Modal */}
      <GameReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        moves={moves}
      />

      {/* FEN / PGN Import Modal */}
      {showFenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Import FEN or PGN</h3>
            <p className="text-xs text-zinc-400 mb-4">Paste any chess position FEN string or full PGN game to analyze with Stockfish.</p>
            <textarea
              rows={4}
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
              placeholder="e.g. rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1 or 1. e4 e5 2. Nf3..."
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowFenModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (fenInput.trim().startsWith('1.') || fenInput.includes('[')) {
                    handleLoadPGN(fenInput.trim());
                  } else {
                    handleLoadFen();
                  }
                }}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white transition shadow-lg shadow-orange-500/20"
              >
                Load Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
