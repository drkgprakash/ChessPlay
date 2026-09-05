import { PuzzleData } from '../types/chess';

export const PUZZLES: PuzzleData[] = [
  {
    id: 'puz-01',
    title: 'Smothered Mate Pattern',
    difficulty: 'Intermediate',
    rating: 1450,
    theme: 'Checkmate Pattern',
    fen: '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1',
    turn: 'w',
    moves: ['Nxc1'],
    hints: {
      piece: 'Look at your knight on e2.',
      square: 'Your knight can capture the rook.',
      solution: 'Nxc1 eliminates the check and defends the king safely.'
    },
    explanation: 'The black rook was delivering checkmate on c1, but your knight on e2 had a backward tactical guard.'
  },
  {
    id: 'puz-02',
    title: 'Queen & Bishop Battery Mate',
    difficulty: 'Beginner',
    rating: 1100,
    theme: 'Mate in 1',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
    turn: 'w',
    moves: ['Qxf7#'],
    hints: {
      piece: 'Your queen can coordinate with the bishop on c4.',
      square: 'Attack the weak f7 pawn next to the black king.',
      solution: 'Qxf7# delivers an inescapable checkmate!'
    },
    explanation: 'f7 is the weakest square in the starting position because only the black king protects it.'
  },
  {
    id: 'puz-03',
    title: 'The Royal Knight Fork',
    difficulty: 'Intermediate',
    rating: 1520,
    theme: 'Knight Fork',
    fen: 'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8',
    turn: 'w',
    moves: ['O-O'],
    hints: {
      piece: 'Prioritize king safety before advancing.',
      square: 'Castle kingside.',
      solution: 'O-O resolves the pin on the knight.'
    },
    explanation: 'Castling breaks the pin and readies the rook for central open files.'
  },
  {
    id: 'puz-04',
    title: 'Anastasia Mate Motif',
    difficulty: 'Advanced',
    rating: 1780,
    theme: 'Mating Net',
    fen: '5rk1/1p3ppp/pq2p3/3p4/8/1P3Q2/P1r2PPP/R4RK1 w - - 0 20',
    turn: 'w',
    moves: ['Qd3'],
    hints: {
      piece: 'Reposition the queen to hit the infiltrated rook.',
      square: 'Target both the rook on c2 and the kingside.',
      solution: 'Qd3 forks the black rook while maintaining central dominance.'
    },
    explanation: 'Centralizing your queen with tempo forces Black on the defensive.'
  },
  {
    id: 'puz-05',
    title: 'Opera House Deflection',
    difficulty: 'Advanced',
    rating: 1950,
    theme: 'Deflection & Pin',
    fen: '4kb1r/p2n1ppp/4p3/1r1p4/3P4/2B1P3/PP3PPP/R3K1NR w KQk - 0 14',
    turn: 'w',
    moves: ['Kd2'],
    hints: {
      piece: 'Activate your king in the endgame.',
      square: 'Step to d2 to connect rooks.',
      solution: 'Kd2 secures the d-file and brings the king toward center.'
    },
    explanation: 'In the endgame with queens off the board, the king becomes a dynamic attacking weapon.'
  }
];
