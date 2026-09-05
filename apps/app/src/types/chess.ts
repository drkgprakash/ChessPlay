import { Square } from 'chess.js';

export type MoveClassification = 
  | 'brilliant' 
  | 'great' 
  | 'best' 
  | 'excellent' 
  | 'good' 
  | 'inaccuracy' 
  | 'mistake' 
  | 'blunder' 
  | 'missed_win';

export interface EvaluatedMove {
  san: string;
  from: Square;
  to: Square;
  fen: string;
  evalBefore: number; // in centipawns (positive = White, negative = Black)
  evalAfter: number;
  bestMoveSan?: string;
  classification?: MoveClassification;
  explanation?: string;
  tacticalMotif?: string;
}

export interface EngineAnalysisResult {
  depth: number;
  score: number;
  isMate: boolean;
  mateIn?: number;
  bestMove: string;
  bestMoveSan: string;
  pv: string[];
  nodes: number;
  nps: number;
  multipv?: {
    rank: number;
    score: number;
    isMate: boolean;
    mateIn?: number;
    bestMoveSan: string;
    pv: string[];
  }[];
}

export interface PuzzleData {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  rating: number;
  theme: string;
  fen: string;
  turn: 'w' | 'b';
  moves: string[];
  hints: {
    piece: string;
    square: string;
    solution: string;
  };
  explanation: string;
}

export interface StudentProgress {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  puzzlesSolved: number;
  attendancePct: number;
  homeworkScorePct: number;
  recentForm: ('W' | 'L' | 'D')[];
  coachNotes: string;
}

export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  border: string;
}

export type AnnotationColor = 'green' | 'red' | 'blue' | 'yellow' | 'orange';

export interface ArrowAnnotation {
  from: Square;
  to: Square;
  color: AnnotationColor;
}

export interface SquareHighlight {
  square: Square;
  color: AnnotationColor;
}
