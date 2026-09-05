// =========================================================
// Chess Play Curated Grandmaster Masterclasses
// Famous historical games for interactive classroom analysis
// =========================================================

export interface MasterGame {
  id: string;
  title: string;
  subtitle: string;
  white: string;
  black: string;
  event: string;
  date: string;
  eco: string;
  result: string;
  theme: string;
  description: string;
  moves: string[]; // SAN moves
  initialFen?: string;
  keyMoments?: Array<{ moveNumber: number; annotation: string }>;
}

export const MASTER_GAMES: MasterGame[] = [
  {
    id: 'mg-01',
    title: "Kasparov's Immortal",
    subtitle: 'Brilliant double rook sacrifice and 15-move king hunt',
    white: 'Garry Kasparov (2812)',
    black: 'Veselin Topalov (2700)',
    event: 'Hoogovens Wijk aan Zee',
    date: '1999.01.20',
    eco: 'B07',
    result: '1-0',
    theme: 'King Hunt & Piece Sacrifice',
    description: 'Widely considered one of the greatest chess games ever played. Kasparov sacrifices both rooks to chase the black king from c8 across the board to a1.',
    moves: [
      'e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'Qd2', 'c6',
      'f3', 'b5', 'Nge2', 'Nbd7', 'Bh6', 'Bxh6', 'Qxh6', 'Bb7', 'a3', 'e5',
      'O-O-O', 'Qe7', 'Kb1', 'a6', 'Nc1', 'O-O-O', 'Nb3', 'exd4', 'Rxd4', 'c5',
      'Rd1', 'Nb6', 'g3', 'Kb8', 'Na5', 'Ba8', 'Bh3', 'd5', 'Qf4+', 'Ka7',
      'Rhe1', 'd4', 'Nd5', 'Nbxd5', 'exd5', 'Qd6', 'Rxd4', 'cxd4', 'Re7+', 'Kb6',
      'Qxd4+', 'Kxa5', 'b4+', 'Ka4', 'Qc3', 'Qxd5', 'Ra7', 'Bb7', 'Rxb7', 'Qc4',
      'Qxf6', 'Kxa3', 'Qxa6+', 'Kxb4', 'c3+', 'Kxc3', 'Qa1+', 'Kd2', 'Qb2+', 'Kd1',
      'Bf1', 'Rd2', 'Rd7', 'Rxd7', 'Bxc4', 'bxc4', 'Qxh8', 'Rd3', 'Qa8', 'c3',
      'Qa4+', 'Ke1', 'f4', 'f5', 'Kc1', 'Rd2', 'Qa7'
    ]
  },
  {
    id: 'mg-02',
    title: 'The Opera House Game',
    subtitle: 'Flawless rapid development and queen sacrifice checkmate',
    white: 'Paul Morphy',
    black: 'Duke of Brunswick & Count Isouard',
    event: 'Paris Opera House',
    date: '1858.11.02',
    eco: 'C41',
    result: '1-0',
    theme: 'Rapid Development & Pins',
    description: 'The golden standard of classical development and dynamic tempo. Morphy develops every piece with threats, then finishes with a spectacular queen sacrifice.',
    moves: [
      'e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4', 'dxe5', 'Bxf3', 'Qxf3', 'dxe5',
      'Bc4', 'Nf6', 'Qb3', 'Qe7', 'Nc3', 'c6', 'Bg5', 'b5', 'Nxb5', 'cxb5',
      'Bxb5+', 'Nbd7', 'O-O-O', 'Rd8', 'Rxd7', 'Rxd7', 'Rd1', 'Qe6', 'Bxd7+', 'Nxd7',
      'Qb8+', 'Nxb8', 'Rd8#'
    ]
  },
  {
    id: 'mg-03',
    title: "Fischer's Game 6 Masterpiece",
    subtitle: 'Deep positional prophylaxis in the Queen’s Gambit Declined',
    white: 'Bobby Fischer',
    black: 'Boris Spassky',
    event: 'World Chess Championship (Reykjavik)',
    date: '1972.07.23',
    eco: 'D59',
    result: '1-0',
    theme: 'Positional Masterpiece',
    description: 'Fischer surprised the world by opening with 1. c4 instead of his customary 1. e4. Spassky applauded Fischer alongside the audience at the end of this game.',
    moves: [
      'c4', 'e6', 'Nf3', 'd5', 'd4', 'Nf6', 'Nc3', 'Be7', 'Bg5', 'O-O',
      'e3', 'h6', 'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5',
      'Rc1', 'Be6', 'Qa4', 'c5', 'Qa3', 'Rc8', 'Bb5', 'a6', 'dxc5', 'bxc5',
      'O-O', 'Ra7', 'Be2', 'Nd7', 'Nd4', 'Qf8', 'Nxe6', 'fxe6', 'e4', 'd4',
      'f4', 'Qe7', 'e5', 'Rb8', 'Bc4', 'Kh8', 'Qh3', 'Nf8', 'b3', 'a5',
      'f5', 'exf5', 'Rxf5', 'Nh7', 'Rcf1', 'Qd8', 'Qg3', 'Re7', 'h4', 'Rbb7',
      'e6', 'Rbc7', 'Qe5', 'Qe8', 'a4', 'Qd8', 'R1f2', 'Qe8', 'R2f3', 'Qd8',
      'Bd3', 'Qe8', 'Qe4', 'Nf6', 'Rxf6', 'gxf6', 'Rxf6', 'Kg8', 'Bc4', 'Kh8',
      'Qf4'
    ]
  },
  {
    id: 'mg-04',
    title: 'Tal’s Sicilian Knight Sacrifice',
    subtitle: 'Dynamic knight sacrifice on d5 cracking the central fortress',
    white: 'Mikhail Tal',
    black: 'Bent Larsen',
    event: 'Candidates Semifinal (Bled)',
    date: '1965.08.08',
    eco: 'B82',
    result: '1-0',
    theme: 'Attacking Demolition',
    description: 'The Magician of Riga unleashes a trademark intuitive knight sacrifice on d5 that shatters Black’s king shelter and sets off fireworks.',
    moves: [
      'e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'e6', 'Nc3', 'd6',
      'Be3', 'Nf6', 'f4', 'Be7', 'Qf3', 'O-O', 'O-O-O', 'Qc7', 'Ndb5', 'Qb8',
      'g4', 'a6', 'Nd4', 'Nxd4', 'Bxd4', 'b5', 'g5', 'Nd7', 'Bd3', 'b4',
      'Nd5', 'exd5', 'exd5', 'f5', 'Rde1', 'Rf7', 'h4', 'Nc5', 'Bxc5', 'dxc5',
      'd6', 'Bb7', 'Bc4', 'Bxd6', 'Bxf7+', 'Kxf7', 'Qh5+', 'Kg8', 'Rhf1', 'Bxf4+',
      'Kb1', 'Qd6', 'Re8+', 'Rxe8', 'Qxe8+', 'Qf8', 'Qxf8+', 'Kxf8', 'Rxf4'
    ]
  }
];
