import React from 'react';

interface EvalBarProps {
  score: number; // Centipawns (positive = White, negative = Black)
  isMate?: boolean;
  mateIn?: number;
  orientation?: 'w' | 'b';
}

export const EvalBar: React.FC<EvalBarProps> = ({
  score,
  isMate,
  mateIn,
  orientation = 'w'
}) => {
  // Convert score to percentage (0% to 100% white height)
  // Logistic sigmoid mapping so large advantages saturate near 100%
  let whitePercentage = 50;

  if (isMate && mateIn !== undefined) {
    if (score > 0) {
      whitePercentage = 100;
    } else {
      whitePercentage = 0;
    }
  } else {
    // Normal centipawn conversion: +500 cp ~ 90%, 0 cp = 50%, -500 cp ~ 10%
    const winChance = 1 / (1 + Math.pow(10, -score / 400));
    whitePercentage = Math.max(5, Math.min(95, winChance * 100));
  }

  // Adjust for orientation
  const barHeight = orientation === 'w' ? whitePercentage : 100 - whitePercentage;

  // Formatted score text
  let scoreText = '0.0';
  if (isMate && mateIn !== undefined) {
    scoreText = score > 0 ? `M${mateIn}` : `-M${mateIn}`;
  } else {
    const pawns = (score / 100).toFixed(1);
    scoreText = score > 0 ? `+${pawns}` : pawns;
  }

  return (
    <div className="relative w-7 h-full rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 shadow-inner flex flex-col justify-end select-none">
      {/* Black area at top */}
      <div className="w-full bg-zinc-900 transition-all duration-300 ease-out flex-1 relative flex items-start justify-center pt-1.5">
        {orientation === 'w' && score < 0 && (
          <span className="text-[10px] font-mono font-bold text-zinc-300 z-10">{scoreText}</span>
        )}
        {orientation === 'b' && score > 0 && (
          <span className="text-[10px] font-mono font-bold text-zinc-300 z-10">{scoreText}</span>
        )}
      </div>

      {/* Center 0.0 line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-zinc-600 z-10" />

      {/* White area at bottom */}
      <div
        className="w-full bg-zinc-100 transition-all duration-300 ease-out relative flex items-end justify-center pb-1.5"
        style={{ height: `${barHeight}%` }}
      >
        {orientation === 'w' && score >= 0 && (
          <span className="text-[10px] font-mono font-bold text-zinc-900 z-10">{scoreText}</span>
        )}
        {orientation === 'b' && score <= 0 && (
          <span className="text-[10px] font-mono font-bold text-zinc-900 z-10">{scoreText}</span>
        )}
      </div>
    </div>
  );
};
