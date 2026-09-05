import React, { useState, useRef, useEffect } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { ArrowAnnotation, SquareHighlight } from '../types/chess';
import { sounds } from '../utils/soundEffects';

interface ChessBoardProps {
  chess: Chess;
  onMove?: (from: Square, to: Square, promotion?: PieceSymbol) => void;
  orientation?: 'w' | 'b';
  interactive?: boolean;
  arrows?: ArrowAnnotation[];
  highlights?: SquareHighlight[];
  onAddArrow?: (arrow: ArrowAnnotation) => void;
  onAddHighlight?: (highlight: SquareHighlight) => void;
  onClearAnnotations?: () => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  onMove,
  orientation = 'w',
  interactive = true,
  arrows = [],
  highlights = [],
  onAddArrow,
  onAddHighlight,
  onClearAnnotations
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [draggingPiece, setDraggingPiece] = useState<{ square: Square; piece: { type: PieceSymbol; color: Color } } | null>(null);

  // Right-click drawing state
  const [rightDragStart, setRightDragStart] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Detect last move from history
  const history = chess.history({ verbose: true });
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  // Detect king in check
  const isCheck = chess.isCheck();
  let kingInCheckSquare: Square | null = null;
  if (isCheck) {
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          kingInCheckSquare = `${FILES[c]}${8 - r}` as Square;
        }
      }
    }
  }

  const files = orientation === 'w' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'w' ? RANKS : [...RANKS].reverse();

  // Helper to get square from client X, Y
  const getSquareFromCoords = (clientX: number, clientY: number): Square | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return null;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const fileIdx = Math.floor((x / rect.width) * 8);
    const rankIdx = Math.floor((y / rect.height) * 8);

    if (fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8) {
      const file = files[fileIdx];
      const rank = ranks[rankIdx];
      return `${file}${rank}` as Square;
    }
    return null;
  };

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;

    // If square already selected, unselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // If attempting to make a move to a legal target
    if (selectedSquare && legalMoves.includes(square)) {
      makeMove(selectedSquare, square);
      return;
    }

    // Check if clicked square has a piece belonging to turn
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to));
      // Clear right-click annotations on active play
      if (onClearAnnotations) onClearAnnotations();
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const makeMove = (from: Square, to: Square) => {
    // Check if pawn promotion
    const piece = chess.get(from);
    let promotion: PieceSymbol | undefined;
    if (piece && piece.type === 'p') {
      if ((piece.color === 'w' && to.endsWith('8')) || (piece.color === 'b' && to.endsWith('1'))) {
        promotion = 'q'; // Default to queen
      }
    }

    if (onMove) {
      onMove(from, to, promotion);
    }

    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // Right-click handling for arrows & highlights
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      // Right-click
      const sq = getSquareFromCoords(e.clientX, e.clientY);
      if (sq) {
        setRightDragStart(sq);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 2 && rightDragStart) {
      const endSq = getSquareFromCoords(e.clientX, e.clientY);
      if (endSq) {
        if (endSq === rightDragStart) {
          // Toggle highlight
          if (onAddHighlight) {
            onAddHighlight({ square: endSq, color: 'orange' });
          }
        } else {
          // Add arrow
          if (onAddArrow) {
            onAddArrow({ from: rightDragStart, to: endSq, color: 'green' });
          }
        }
      }
      setRightDragStart(null);
    }
  };

  // Arrow drawing math
  const getSquareCenter = (square: Square) => {
    const file = square[0];
    const rank = square[1];
    const colIdx = files.indexOf(file);
    const rowIdx = ranks.indexOf(rank);
    return {
      x: (colIdx + 0.5) * (100 / 8),
      y: (rowIdx + 0.5) * (100 / 8)
    };
  };

  return (
    <div
      ref={boardRef}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative aspect-square w-full max-w-[620px] rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-800 select-none bg-zinc-900"
    >
      {/* 8x8 Grid Squares */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, rIdx) =>
          files.map((file, fIdx) => {
            const square = `${file}${rank}` as Square;
            const isLight = (fIdx + rIdx) % 2 === 0;
            const piece = chess.get(square);

            const isSelected = selectedSquare === square;
            const isLegalTarget = legalMoves.includes(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheckSquare = kingInCheckSquare === square;

            // Highlight check
            const highlightObj = highlights.find(h => h.square === square);

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                  isLight ? 'bg-[#eeeed2]' : 'bg-[#769656]'
                }`}
              >
                {/* Last move highlight */}
                {(isLastMoveFrom || isLastMoveTo) && (
                  <div className="absolute inset-0 bg-yellow-400/40 pointer-events-none" />
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <div className="absolute inset-0 bg-sky-500/50 pointer-events-none" />
                )}

                {/* Check alert */}
                {isCheckSquare && (
                  <div className="absolute inset-0 bg-red-600/70 radial-gradient pointer-events-none animate-pulse" />
                )}

                {/* Custom user right-click square highlight */}
                {highlightObj && (
                  <div className="absolute inset-0 bg-orange-500/50 pointer-events-none" />
                )}

                {/* Chess Piece */}
                {piece && (
                  <div className="w-[86%] h-[86%] relative z-10 transition-transform duration-100 active:scale-110">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Legal Move Indicator (Dot or Capture Ring) */}
                {isLegalTarget && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    {piece ? (
                      // Capture ring
                      <div className="w-[84%] h-[84%] rounded-full border-4 border-black/30" />
                    ) : (
                      // Center dot
                      <div className="w-4 h-4 rounded-full bg-black/25" />
                    )}
                  </div>
                )}

                {/* Rank & File Coordinate Labels */}
                {fIdx === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-bold select-none ${
                      isLight ? 'text-[#769656]' : 'text-[#eeeed2]'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-bold select-none ${
                      isLight ? 'text-[#769656]' : 'text-[#eeeed2]'
                    }`}
                  >
                    {file}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Overlay for Arrows */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 100 100">
        <defs>
          <marker
            id="arrow-green"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(34, 197, 94, 0.85)" />
          </marker>
          <marker
            id="arrow-orange"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(249, 115, 22, 0.85)" />
          </marker>
        </defs>

        {arrows.map((arr, i) => {
          const fromPt = getSquareCenter(arr.from);
          const toPt = getSquareCenter(arr.to);
          const color = arr.color === 'orange' ? 'rgba(249, 115, 22, 0.85)' : 'rgba(34, 197, 94, 0.85)';
          const markerId = arr.color === 'orange' ? 'url(#arrow-orange)' : 'url(#arrow-green)';

          return (
            <line
              key={i}
              x1={fromPt.x}
              y1={fromPt.y}
              x2={toPt.x}
              y2={toPt.y}
              stroke={color}
              strokeWidth="2.4"
              strokeLinecap="round"
              markerEnd={markerId}
            />
          );
        })}
      </svg>
    </div>
  );
};
