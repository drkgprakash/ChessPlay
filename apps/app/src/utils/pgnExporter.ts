// =========================================================
// Chess Play FIDE PGN Export & Download Utility
// Generates standard 7-tag roster PGN files with annotations
// =========================================================

import { Chess } from 'chess.js';

export interface PgnMetadata {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  fen?: string;
  eco?: string;
  annotator?: string;
}

/**
 * Format date in FIDE PGN format (YYYY.MM.DD)
 */
export function getFideDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

/**
 * Generate standard FIDE PGN string from a chess.js instance and metadata
 */
export function generateFidePgn(chess: Chess, meta?: PgnMetadata): string {
  const dateStr = meta?.date || getFideDateString();
  const event = meta?.event || "Achiever's Chess Academy Live Masterclass";
  const site = meta?.site || "ChessPlay.in (Online Masterclass)";
  const round = meta?.round || "Batch Alpha";
  const white = meta?.white || "GM Vikram Sen (Chief Instructor)";
  const black = meta?.black || "Batch Alpha Students";
  const result = meta?.result || (chess.isCheckmate() ? (chess.turn() === 'w' ? '0-1' : '1-0') : (chess.isDraw() ? '1/2-1/2' : '*'));

  const headers = [
    `[Event "${event}"]`,
    `[Site "${site}"]`,
    `[Date "${dateStr}"]`,
    `[Round "${round}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`,
    `[Annotator "${meta?.annotator || 'ChessPlay Enterprise OS'}"]`
  ];

  if (meta?.eco) {
    headers.push(`[ECO "${meta.eco}"]`);
  }

  // If game didn't start from standard position
  const initialFen = meta?.fen;
  if (initialFen && initialFen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    headers.push(`[SetUp "1"]`);
    headers.push(`[FEN "${initialFen}"]`);
  }

  // Move history
  const history = chess.history();
  let moveText = '';
  for (let i = 0; i < history.length; i++) {
    if (i % 2 === 0) {
      moveText += `${Math.floor(i / 2) + 1}. `;
    }
    moveText += `${history[i]} `;
  }

  if (moveText.trim() === '') {
    moveText = result;
  } else {
    moveText = `${moveText.trim()} ${result}`;
  }

  return `${headers.join('\n')}\n\n${moveText}\n`;
}

/**
 * Trigger immediate browser file download for a PGN file
 */
export function downloadPgnFile(filename: string, pgnContent: string): void {
  const blob = new Blob([pgnContent], { type: 'application/x-chess-pgn;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pgn') ? filename : `${filename}.pgn`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
