import { Chess, Square, PieceSymbol } from 'chess.js';
import { EngineAnalysisResult, EvaluatedMove, MoveClassification } from '../types/chess';

// Material weights (in centipawns)
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (from White's perspective)
// Pawns encourage center advance and promotion
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

// Knights favor central outposts, avoid edges
const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

// Bishops favor long diagonals and central squares
const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

// Rooks favor 7th rank and open files
const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

// Queen maintains mobility while avoiding premature exposure
const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

// King in middlegame favors castled safety behind pawns
const KING_TABLE_MIDDLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square: Square): number {
  const file = square.charCodeAt(0) - 97; // a-h -> 0-7
  const rank = 8 - parseInt(square[1], 10); // 1-8 -> 7-0
  return rank * 8 + file;
}

export class ChessEngine {
  private nodesCount = 0;

  // Static evaluation function (Positive = White advantage, Negative = Black)
  public evaluatePosition(chess: Chess): number {
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        return chess.turn() === 'w' ? -20000 : 20000;
      }
      return 0; // Draw (stalemate, 3-fold, 50-move)
    }

    let score = 0;
    const board = chess.board();

    let whiteBishops = 0;
    let blackBishops = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type];
        const squareIdx = r * 8 + c;
        const flippedIdx = (7 - r) * 8 + c;

        let pstBonus = 0;
        switch (piece.type) {
          case 'p':
            pstBonus = piece.color === 'w' ? PAWN_TABLE[squareIdx] : PAWN_TABLE[flippedIdx];
            break;
          case 'n':
            pstBonus = piece.color === 'w' ? KNIGHT_TABLE[squareIdx] : KNIGHT_TABLE[flippedIdx];
            break;
          case 'b':
            pstBonus = piece.color === 'w' ? BISHOP_TABLE[squareIdx] : BISHOP_TABLE[flippedIdx];
            if (piece.color === 'w') whiteBishops++; else blackBishops++;
            break;
          case 'r':
            pstBonus = piece.color === 'w' ? ROOK_TABLE[squareIdx] : ROOK_TABLE[flippedIdx];
            break;
          case 'q':
            pstBonus = piece.color === 'w' ? QUEEN_TABLE[squareIdx] : QUEEN_TABLE[flippedIdx];
            break;
          case 'k':
            pstBonus = piece.color === 'w' ? KING_TABLE_MIDDLE[squareIdx] : KING_TABLE_MIDDLE[flippedIdx];
            break;
        }

        const totalPieceScore = val + pstBonus;
        if (piece.color === 'w') {
          score += totalPieceScore;
        } else {
          score -= totalPieceScore;
        }
      }
    }

    // Bishop pair bonuses
    if (whiteBishops >= 2) score += 35;
    if (blackBishops >= 2) score -= 35;

    // Mobility bonus (legal move count)
    const moves = chess.moves().length;
    const mobilityBonus = Math.min(moves * 2, 40);
    score += chess.turn() === 'w' ? mobilityBonus : -mobilityBonus;

    return score;
  }

  // Quiescence search to handle captures and avoid horizon effect
  private quiescence(chess: Chess, alpha: number, beta: number, maxDepth = 4): number {
    this.nodesCount++;
    const standPat = this.evaluatePosition(chess) * (chess.turn() === 'w' ? 1 : -1);

    if (maxDepth === 0) return standPat;
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    // Only search captures in quiescence
    const captureMoves = chess.moves({ verbose: true }).filter(m => m.captured);

    // MVV-LVA move ordering: prioritize highest value captured piece with lowest attacker
    captureMoves.sort((a, b) => {
      const valA = (a.captured ? PIECE_VALUES[a.captured] : 0) - PIECE_VALUES[a.piece];
      const valB = (b.captured ? PIECE_VALUES[b.captured] : 0) - PIECE_VALUES[b.piece];
      return valB - valA;
    });

    for (const move of captureMoves) {
      chess.move(move);
      const score = -this.quiescence(chess, -beta, -alpha, maxDepth - 1);
      chess.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  // Alpha-beta minimax search
  private alphaBeta(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizingTurn: boolean
  ): { score: number; bestMoveSan?: string } {
    this.nodesCount++;

    if (depth === 0 || chess.isGameOver()) {
      return { score: this.quiescence(chess, alpha, beta) * (chess.turn() === 'w' ? 1 : -1) };
    }

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) {
      if (chess.isCheck()) {
        return { score: isMaximizingTurn ? -20000 + (10 - depth) : 20000 - (10 - depth) };
      }
      return { score: 0 };
    }

    // Move ordering: checks and captures first
    legalMoves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
      if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
      if (a.promotion) scoreA += 800;
      if (b.promotion) scoreB += 800;
      return scoreB - scoreA;
    });

    let bestMoveSan: string | undefined;

    if (isMaximizingTurn) {
      let maxScore = -Infinity;
      for (const move of legalMoves) {
        chess.move(move);
        const { score } = this.alphaBeta(chess, depth - 1, alpha, beta, false);
        chess.undo();

        if (score > maxScore) {
          maxScore = score;
          bestMoveSan = move.san;
        }
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Pruning
      }
      return { score: maxScore, bestMoveSan };
    } else {
      let minScore = Infinity;
      for (const move of legalMoves) {
        chess.move(move);
        const { score } = this.alphaBeta(chess, depth - 1, alpha, beta, true);
        chess.undo();

        if (score < minScore) {
          minScore = score;
          bestMoveSan = move.san;
        }
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Pruning
      }
      return { score: minScore, bestMoveSan };
    }
  }

  // Find best move for the current position
  public findBestMove(chess: Chess, depth = 3): EngineAnalysisResult {
    this.nodesCount = 0;
    const startTime = performance.now();
    const isWhiteTurn = chess.turn() === 'w';

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) {
      return {
        depth: 0,
        score: chess.isCheckmate() ? (isWhiteTurn ? -20000 : 20000) : 0,
        isMate: chess.isCheckmate(),
        bestMove: '',
        bestMoveSan: '',
        pv: [],
        nodes: 0,
        nps: 0
      };
    }

    const multiPvResults: {
      rank: number;
      score: number;
      isMate: boolean;
      mateIn?: number;
      bestMoveSan: string;
      pv: string[];
    }[] = [];

    let overallBestMove = legalMoves[0];
    let overallBestScore = isWhiteTurn ? -Infinity : Infinity;

    for (const move of legalMoves) {
      chess.move(move);
      const { score } = this.alphaBeta(chess, depth - 1, -Infinity, Infinity, !isWhiteTurn);
      chess.undo();

      const candidateScore = score;
      multiPvResults.push({
        rank: 0,
        score: candidateScore,
        isMate: Math.abs(candidateScore) > 10000,
        mateIn: Math.abs(candidateScore) > 10000 ? Math.ceil((20000 - Math.abs(candidateScore)) / 2) : undefined,
        bestMoveSan: move.san,
        pv: [move.san]
      });

      if (isWhiteTurn) {
        if (candidateScore > overallBestScore) {
          overallBestScore = candidateScore;
          overallBestMove = move;
        }
      } else {
        if (candidateScore < overallBestScore) {
          overallBestScore = candidateScore;
          overallBestMove = move;
        }
      }
    }

    // Sort MultiPV by candidate score
    multiPvResults.sort((a, b) => isWhiteTurn ? b.score - a.score : a.score - b.score);
    multiPvResults.forEach((item, index) => {
      item.rank = index + 1;
    });

    const elapsed = Math.max(performance.now() - startTime, 1);
    const nps = Math.round((this.nodesCount / elapsed) * 1000);

    return {
      depth,
      score: overallBestScore,
      isMate: Math.abs(overallBestScore) > 10000,
      mateIn: Math.abs(overallBestScore) > 10000 ? Math.ceil((20000 - Math.abs(overallBestScore)) / 2) : undefined,
      bestMove: overallBestMove.from + overallBestMove.to,
      bestMoveSan: overallBestMove.san,
      pv: multiPvResults[0]?.pv || [overallBestMove.san],
      nodes: this.nodesCount,
      nps,
      multipv: multiPvResults.slice(0, 3)
    };
  }

  // Classify a move based on centipawn loss and game context
  public classifyMove(
    chessBefore: Chess,
    moveSan: string,
    evalBefore: number,
    evalAfter: number,
    bestMoveSan: string
  ): { classification: MoveClassification; explanation: string; motif: string } {
    const isWhite = chessBefore.turn() === 'w';
    // Normalized difference from moving player's perspective
    const cpLoss = isWhite ? (evalBefore - evalAfter) : (evalAfter - evalBefore);

    // Check if player found a piece sacrifice that remains heavily winning (Brilliant)
    const moveVerbose = chessBefore.moves({ verbose: true }).find(m => m.san === moveSan);
    const isSacrifice = moveVerbose && ['n', 'b', 'r', 'q'].includes(moveVerbose.piece) && 
                        PIECE_VALUES[moveVerbose.piece] >= 300 && 
                        (isWhite ? evalAfter > 200 : evalAfter < -200);

    if (moveSan === bestMoveSan && isSacrifice) {
      return {
        classification: 'brilliant',
        explanation: 'Brilliant! A stunning tactical sacrifice that unlocks a decisive mating attack or overwhelming material advantage.',
        motif: 'Sacrifice'
      };
    }

    if (moveSan === bestMoveSan) {
      return {
        classification: 'best',
        explanation: 'The best move. Maximizes piece activity and maintains optimal strategic pressure.',
        motif: 'Optimal Play'
      };
    }

    // Great move (found only move that keeps advantage)
    if (cpLoss <= 12 && (isWhite ? evalBefore < 0 && evalAfter > 50 : evalBefore > 0 && evalAfter < -50)) {
      return {
        classification: 'great',
        explanation: 'Great move! A critical defense or counter-attack that shifts the balance in your favor.',
        motif: 'Critical Defense'
      };
    }

    if (cpLoss <= 25) {
      return {
        classification: 'excellent',
        explanation: 'An excellent choice. Nearly as strong as the top engine recommendation.',
        motif: 'Strong Development'
      };
    }

    if (cpLoss <= 50) {
      return {
        classification: 'good',
        explanation: 'A solid, playable move that keeps the position sound.',
        motif: 'Solid Play'
      };
    }

    if (cpLoss <= 110) {
      return {
        classification: 'inaccuracy',
        explanation: `Slight inaccuracy. Better was ${bestMoveSan}, which offered more central control or faster piece mobilization.`,
        motif: 'Inaccuracy'
      };
    }

    if (cpLoss <= 240) {
      return {
        classification: 'mistake',
        explanation: `Mistake. ${bestMoveSan} was substantially better. This move allows opponent tactical counterplay.`,
        motif: 'Tactical Concession'
      };
    }

    // Check if missed win (went from +350 to <= 0)
    const wasWinning = isWhite ? evalBefore > 350 : evalBefore < -350;
    const isNoLongerWinning = isWhite ? evalAfter < 100 : evalAfter > -100;
    if (wasWinning && isNoLongerWinning) {
      return {
        classification: 'missed_win',
        explanation: `Missed Win! You had a decisive winning sequence starting with ${bestMoveSan}.`,
        motif: 'Missed Win'
      };
    }

    return {
      classification: 'blunder',
      explanation: `Blunder! This drops material or compromises king safety. ${bestMoveSan} was essential.`,
      motif: 'Blunder'
    };
  }

  // Calculate CAPS-style accuracy score for White and Black
  public calculateAccuracy(avgCpLoss: number): number {
    if (avgCpLoss <= 0) return 100;
    const acc = 103.1668 * Math.exp(-0.04354 * avgCpLoss) - 3.1669;
    return Math.max(5, Math.min(99.8, Math.round(acc * 10) / 10));
  }
}

export const defaultEngine = new ChessEngine();
