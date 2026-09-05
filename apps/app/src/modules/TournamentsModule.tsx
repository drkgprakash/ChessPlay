import React, { useState } from 'react';
import { Trophy, Users, Clock, Flame, Shield, Award, Play, ChevronRight, Zap } from 'lucide-react';

interface TournamentPlayer {
  rank: number;
  name: string;
  avatar: string;
  rating: number;
  score: number;
  buchholz: number;
  streak: number;
  performance: number;
}

const SAMPLE_STANDINGS: TournamentPlayer[] = [
  { rank: 1, name: 'Aarav Sharma', avatar: '👦', rating: 1640, score: 4.5, buchholz: 14.0, streak: 4, performance: 1820 },
  { rank: 2, name: 'Diya Patel', avatar: '👧', rating: 1580, score: 4.0, buchholz: 13.5, streak: 2, performance: 1710 },
  { rank: 3, name: 'Rohan Iyer', avatar: '🧑', rating: 1520, score: 3.5, buchholz: 12.0, streak: 1, performance: 1590 },
  { rank: 4, name: 'Kabir Verma', avatar: '👦', rating: 1490, score: 3.0, buchholz: 11.5, streak: 0, performance: 1480 },
  { rank: 5, name: 'Ananya Gupta', avatar: '👧', rating: 1430, score: 2.5, buchholz: 10.0, streak: 0, performance: 1410 },
  { rank: 6, name: 'Meera Nair', avatar: '👧', rating: 1390, score: 2.0, buchholz: 9.0, streak: 0, performance: 1350 },
  { rank: 7, name: 'Devansh Joshi', avatar: '👦', rating: 1350, score: 1.5, buchholz: 8.5, streak: 0, performance: 1290 },
  { rank: 8, name: 'Ishaan Reddy', avatar: '👦', rating: 1310, score: 1.0, buchholz: 8.0, streak: 0, performance: 1210 },
];

interface Pairing {
  table: number;
  white: string;
  whiteRating: number;
  black: string;
  blackRating: number;
  result?: string;
}

const CURRENT_PAIRINGS: Pairing[] = [
  { table: 1, white: 'Aarav Sharma', whiteRating: 1640, black: 'Diya Patel', blackRating: 1580, result: 'Ongoing' },
  { table: 2, white: 'Rohan Iyer', whiteRating: 1520, black: 'Kabir Verma', blackRating: 1490, result: 'Ongoing' },
  { table: 3, white: 'Ananya Gupta', whiteRating: 1430, black: 'Meera Nair', blackRating: 1390, result: 'Ongoing' },
  { table: 4, white: 'Devansh Joshi', whiteRating: 1350, black: 'Ishaan Reddy', blackRating: 1310, result: 'Ongoing' },
];

export const TournamentsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'standings' | 'pairings'>('standings');
  const [tournamentType, setTournamentType] = useState<'swiss' | 'arena'>('swiss');

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Tournament Banner Card */}
      <div className="bg-gradient-to-r from-orange-950/50 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-3xl shadow-inner">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">Sunday Rapid Grand Prix — Round 5</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                FIDE Swiss • 5 Rounds
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" /> 10m + 5s Rapid</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 8 Qualified Players</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Round 5 in Progress</span>
            </p>
          </div>
        </div>

        {/* Action / Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setTournamentType('swiss')}
              className={`px-3 py-1.5 rounded-lg transition ${
                tournamentType === 'swiss' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Swiss System
            </button>
            <button
              onClick={() => setTournamentType('arena')}
              className={`px-3 py-1.5 rounded-lg transition ${
                tournamentType === 'arena' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Arena Speed Run
            </button>
          </div>

          <button className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
            <Play className="w-3.5 h-3.5 fill-white" /> Watch Live Board
          </button>
        </div>
      </div>

      {/* Main Content: Standings and Pairings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
        {/* Tab Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'standings'
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Current Standings (FIDE Tie-Breaks)
            </button>
            <button
              onClick={() => setActiveTab('pairings')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'pairings'
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Live Pairings (Round 5)
            </button>
          </div>

          <div className="text-xs text-zinc-400">
            Tie-Break: <strong>Buchholz Cut 1, Performance Rating</strong>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'standings' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-3 text-center">Rating</th>
                  <th className="py-2.5 px-3 text-center">Points</th>
                  <th className="py-2.5 px-3 text-center">Buchholz</th>
                  <th className="py-2.5 px-3 text-center">Streak</th>
                  <th className="py-2.5 px-3 text-center">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {SAMPLE_STANDINGS.map((p) => (
                  <tr key={p.rank} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3 px-3">
                      {p.rank === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center">🥇</span>
                      ) : p.rank === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-zinc-400/20 text-zinc-300 font-bold flex items-center justify-center">🥈</span>
                      ) : p.rank === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold flex items-center justify-center">🥉</span>
                      ) : (
                        <span className="text-zinc-500 font-bold pl-2">{p.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{p.avatar}</span>
                        <span className="font-bold text-zinc-100">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-400">{p.rating}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-orange-400 text-sm">
                      {p.score.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-400">{p.buchholz.toFixed(1)}</td>
                    <td className="py-3 px-3 text-center font-mono">
                      {p.streak > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-orange-400 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {p.streak}
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                      {p.performance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CURRENT_PAIRINGS.map((pair) => (
              <div
                key={pair.table}
                className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 hover:border-zinc-700 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>Table #{pair.table}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                    {pair.result}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  {/* White Player */}
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-zinc-200 text-black flex items-center justify-center font-bold text-xs">
                      ♔
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white">{pair.white}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{pair.whiteRating} ELO</div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-zinc-500 font-mono">VS</span>

                  {/* Black Player */}
                  <div className="flex items-center gap-2 flex-row-reverse text-right">
                    <span className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center font-bold text-xs border border-zinc-700">
                      ♚
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white">{pair.black}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{pair.blackRating} ELO</div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold transition flex items-center justify-center gap-1">
                  Spectate Game <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
