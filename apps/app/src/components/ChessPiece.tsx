import React from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#ffffff' : '#1f2421';
  const stroke = isWhite ? '#222222' : '#ffffff';
  const strokeWidth = 1.5;

  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={`${color} pawn`}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={`${color} knight`}>
          <path
            d="m 22,10 c 10.5,1 16.5,8 16,29 H 15 c 0,-9 10,-6.5 8,-21 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <path
            d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 c -1.5,1 -4,2 -4,2 0,0 1.25,-2.5 1.5,-4 0.25,-1.5 -1.25,-2.5 -2.5,-3 0,0 2.5,-0.5 4,-2 1.5,-1.5 2,-4 2,-4 0,0 2.5,1 4,1 1.5,0 3,-1 3,-1 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="25.5" r="1" fill={isWhite ? '#000' : '#fff'} />
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={`${color} bishop`}>
          <path
            d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,.54 3,2 -0.68,.97 -1.65,.99 -3,.5 -3.39,-.97 -10.11,.46 -13.5,-1 -3.39,1.46 -10.11,.03 -13.5,1 -1.35,.49 -2.32,.47 -3,-.5 1.35,-1.94 3,-2 3,-2 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <path
            d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 .5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -.5,.5 0,2 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <circle cx="22.5" cy="8" r="2.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="m 17.5,16 10,0 M 22.5,11 22.5,21" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={`${color} rook`}>
          <path
            d="m 9,39 h 27 v -3 H 9 Z m 3,-3 v -4 h 21 v 4 z m -1,-22 3,14 h 17 l 3,-14 z m -2,-5 v 4 h 3 v -4 z m 6,0 v 4 h 4 v -4 z m 7,0 v 4 h 4 v -4 z m 7,0 v 4 h 3 v -4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={`${color} queen`}>
          <path
            d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2.5,-12.5 L 31,25 l -.5,-16.5 L 22.5,24 14.5,8.5 14,25 6.5,13.5 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <path
            d="M 9,26 C 9,28 10.5,28 11.5,30 c 1,1.5 1,1 1,3.5 0,1.5 0.5,3 3,3 2.5,0 2.5,-1.5 7,-1.5 4.5,0 4.5,1.5 7,1.5 2.5,0 3,-1.5 3,-3 0,-2.5 0,-2 1,-3.5 1,-2 2.5,-2 2.5,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <circle cx="6" cy="12" r="2" fill={fill} stroke={stroke} />
          <circle cx="14" cy="7" r="2" fill={fill} stroke={stroke} />
          <circle cx="22.5" cy="5" r="2" fill={fill} stroke={stroke} />
          <circle cx="31" cy="7" r="2" fill={fill} stroke={stroke} />
          <circle cx="39" cy="12" r="2" fill={fill} stroke={stroke} />
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className} aria-label={`${color} king`}>
          <path
            d="M 22.5,11.63 V 6 M 20,8 h 5"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="m 22.5,25 c 0,0 4.5,-7.5 3,-10.5 -1.5,-3 -6,-3 -7.5,0 -1.5,3 3,10.5 3,10.5"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="m 11.5,37 c 5.5,3.5 16.5,3.5 22,0 v -7 c 0,0 9,-4.5 6,-10.5 -4,-6.5 -13.5,-3.5 -17,4 -3.5,-7.5 -13,-10.5 -17,-4 -3,6 6,10.5 6,10.5 z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    default:
      return null;
  }
};
