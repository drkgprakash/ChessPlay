import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Trophy, Users, Star, Bot, Video, ShieldCheck, Flame, BookOpen, ExternalLink } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface HomePageProps {
  setCurrentPage: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const [activePill, setActivePill] = useState<'classroom' | 'engine' | 'homework' | 'tournaments' | 'reports'>('classroom');

  const ACADEMIES = [
    "Achiever's Chess Academy",
    "KnightSquad Club",
    "Grandmaster Youth Academy",
    "ChessMasters India",
    "Castle Chess School",
    "Royal Bishop Academy",
    "Checkmate International",
    "Pawn Pioneers Club"
  ];

  return (
    <div className="flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-zinc-800/80">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold mb-8 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The #1 Next-Gen Platform Built for Chess Academies</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Run Your Entire Chess Academy with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Chess Play</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to coach smarter. Live classrooms with multi-board simul, Stockfish 16+ NNUE AI coaching, automated homework, Swiss tournaments, and branded WhatsApp parent reports.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition shadow-xl shadow-orange-500/30 transform hover:-translate-y-0.5"
            >
              Launch Web App (app.chessplay.in) <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setCurrentPage('contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition"
            >
              Book a 1-on-1 Free Demo
            </button>
          </div>

          {/* Social rating line */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <div className="flex text-amber-400">
              {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
            </div>
            <span className="font-semibold text-zinc-300">4.9 / 5</span>
            <span>across 150+ Chess Academies globally</span>
          </div>

          {/* Interactive Feature Preview Tabs */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 w-fit mx-auto">
              <button
                onClick={() => setActivePill('classroom')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activePill === 'classroom' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🎓 Live Classroom & Simul
              </button>
              <button
                onClick={() => setActivePill('engine')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activePill === 'engine' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ⚡ Stockfish 16 AI Coach
              </button>
              <button
                onClick={() => setActivePill('homework')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activePill === 'homework' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                📝 Auto-Graded Homework
              </button>
              <button
                onClick={() => setActivePill('tournaments')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activePill === 'tournaments' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🏆 FIDE Swiss Tournaments
              </button>
              <button
                onClick={() => setActivePill('reports')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activePill === 'reports' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                📊 Branded WhatsApp Reports
              </button>
            </div>

            {/* Feature Showcase Card */}
            <div className="mt-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl text-left">
              {activePill === 'classroom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Classroom Revolution</span>
                    <h3 className="text-2xl font-bold text-white mt-1">Multi-Board Simul & Instant Control</h3>
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                      Say goodbye to juggling Zoom windows and Lichess links. Chess Play gives coaches a live Master Board with synchronous board broadcasting and a revolutionary <strong>Simul Grid View</strong> to monitor 6+ student boards simultaneously.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time board lock & student turn permission
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-color tactical arrows and square highlights
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Integrated HD audio/video and screen sharing
                      </li>
                    </ul>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs">
                    <div className="text-orange-400 font-bold mb-2">Simul Grid Active: 6 Students</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-zinc-900 p-2 rounded border border-emerald-500/40 text-emerald-300">Aarav (Tactics) ✓</div>
                      <div className="bg-zinc-900 p-2 rounded border border-orange-500/40 text-orange-300">Diya (Evaluating)</div>
                      <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-zinc-400">Rohan (Round 4)</div>
                      <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-zinc-400">Kabir (Inaccuracy)</div>
                      <div className="bg-zinc-900 p-2 rounded border border-emerald-500/40 text-emerald-300">Ananya (Checkmate) ✓</div>
                      <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-zinc-400">Meera (Thinking)</div>
                    </div>
                  </div>
                </div>
              )}

              {activePill === 'engine' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Next-Gen Engine</span>
                    <h3 className="text-2xl font-bold text-white mt-1">Stockfish 16+ NNUE & Plain-English AI Coach</h3>
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                      While competitors show raw numbers like "-2.4", Chess Play analyzes the game with Grandmaster precision and translates tactical blunders into clear, human explanations that students actually understand.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Move classifications: Brilliant (!!), Great, Best, Blunder
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CAPS accuracy percentages (0 - 100%) for both sides
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Client-side WebAssembly: 0 server lag, unlimited depth
                      </li>
                    </ul>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>White Accuracy: 88.4%</span>
                      <span className="text-emerald-400">+1.8 Advantage</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-zinc-300">
                      <strong className="text-orange-400 block mb-1">AI Coach Takeaway:</strong>
                      "White found a brilliant tactical sacrifice on h7 tearing open the black king. Black blundered by neglecting kingside development."
                    </div>
                  </div>
                </div>
              )}

              {activePill === 'homework' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Curriculum Automation</span>
                    <h3 className="text-2xl font-bold text-white mt-1">Automated Homework with 3-Stage Hints</h3>
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                      Coaches save 5+ hours every week. Assign tactical sets with one click. Students solve interactive positions with progressive hint support (Piece → Square → Solution) that builds genuine problem-solving confidence.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 10,000+ curated tactical positions and endgame studies
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Immediate grading and coach assignment dashboards
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Streak gamification and confetti rewards
                      </li>
                    </ul>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs space-y-2">
                    <div className="text-xs text-yellow-300 font-bold">Progressive Hint Stage 2:</div>
                    <p className="text-zinc-300 text-xs font-sans">
                      "Look at the f7 square right next to the black king. Which piece can coordinate with the bishop?"
                    </p>
                    <div className="text-emerald-400 font-bold pt-1">Streak: 6 in a row 🔥</div>
                  </div>
                </div>
              )}

              {activePill === 'tournaments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Tournament Hub</span>
                    <h3 className="text-2xl font-bold text-white mt-1">FIDE-Compliant Swiss & Speed Arena</h3>
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                      Host internal club championships or inter-academy opens. Automated Swiss pairings with official Buchholz Cut 1, Sonneborn-Berger tie-break calculations, or fast-paced Arena tournaments.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant round pairings with color allocation balance
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live spectator broadcast link for parents and alumni
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated performance rating calculation
                      </li>
                    </ul>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between text-zinc-400 font-bold border-b border-zinc-800 pb-1">
                      <span># Player</span>
                      <span>Pts / Buchholz</span>
                    </div>
                    <div className="flex justify-between text-white"><span>1. Aarav Sharma</span><span className="text-orange-400">4.5 (14.0)</span></div>
                    <div className="flex justify-between text-white"><span>2. Diya Patel</span><span className="text-orange-400">4.0 (13.5)</span></div>
                    <div className="flex justify-between text-white"><span>3. Rohan Iyer</span><span className="text-orange-400">3.5 (12.0)</span></div>
                  </div>
                </div>
              )}

              {activePill === 'reports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Parent Delight</span>
                    <h3 className="text-2xl font-bold text-white mt-1">Automated WhatsApp & Email Progress Cards</h3>
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                      Keep parents engaged and retention high. Chess Play auto-generates beautiful monthly progress reports with attendance stats, homework completion, rating changes, and coach remarks.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-click WhatsApp message delivery to parents
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom branding with academy logo and colors
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Increases student retention by over 38%
                      </li>
                    </ul>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span>📱 WhatsApp Preview Sent</span>
                    </div>
                    <p className="text-zinc-300 italic text-[11px]">
                      "Dear Mrs. Sharma, Aarav attended 96% of classes this month and solved 142 tactical puzzles! Check out his monthly report..."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Academy Marquee */}
      <section className="py-8 bg-zinc-900/50 border-b border-zinc-800/80 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Trusted by Coaches & Academies Across 15+ Countries
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70">
          {ACADEMIES.map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <span className="text-orange-500">♟</span>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Competitor Benchmarking Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Head-to-Head Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Why Chess Academies Choose <span className="text-orange-500">Chess Play</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-3">
            See how Chess Play delivers advanced AI coaching, modern multi-board tools, and better pricing compared to older legacy platforms.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-bold uppercase text-[11px]">
                <th className="p-4 sm:p-5">Platform Feature</th>
                <th className="p-4 sm:p-5 text-orange-400 font-black text-sm">Chess Play (chessplay.in)</th>
                <th className="p-4 sm:p-5">ChessPlay.io</th>
                <th className="p-4 sm:p-5">Chesslang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
              <tr className="bg-orange-500/5">
                <td className="p-4 sm:p-5 font-bold text-white">Chess Engine & Analysis</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Stockfish 16 NNUE (WASM) + Plain English AI Coach</td>
                <td className="p-4 sm:p-5 text-zinc-400">Basic Server Stockfish</td>
                <td className="p-4 sm:p-5 text-zinc-400">Traditional Engine Eval</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-white">Move Classification</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Brilliant (!!), Great, Best, Blunder, Inaccuracy</td>
                <td className="p-4 sm:p-5 text-zinc-400">None</td>
                <td className="p-4 sm:p-5 text-zinc-400">None</td>
              </tr>
              <tr className="bg-orange-500/5">
                <td className="p-4 sm:p-5 font-bold text-white">Classroom Simul Mode</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Live 6+ Student Grid View simultaneously</td>
                <td className="p-4 sm:p-5 text-zinc-400">Single Master Board only</td>
                <td className="p-4 sm:p-5 text-zinc-400">Match & Watch (limited)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-white">Progressive Puzzle Hints</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">3 Stages (Piece → Square → Move Solution)</td>
                <td className="p-4 sm:p-5 text-zinc-400">No progressive hints</td>
                <td className="p-4 sm:p-5 text-zinc-400">Binary pass/fail only</td>
              </tr>
              <tr className="bg-orange-500/5">
                <td className="p-4 sm:p-5 font-bold text-white">Parent Reporting</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Automated 1-Click WhatsApp & Email Cards</td>
                <td className="p-4 sm:p-5 text-zinc-400">Basic PDF generation</td>
                <td className="p-4 sm:p-5 text-zinc-400">Manual export</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-white">Tournament Formats</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">FIDE Swiss (Buchholz/Sonneborn) & Arena Speedrun</td>
                <td className="p-4 sm:p-5 text-zinc-400">Basic Swiss</td>
                <td className="p-4 sm:p-5 text-zinc-400">Swiss & Round Robin</td>
              </tr>
              <tr className="bg-orange-500/5">
                <td className="p-4 sm:p-5 font-bold text-white">Pricing Model</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">Fair tiered & unlimited options</td>
                <td className="p-4 sm:p-5 text-zinc-400">$99 / month flat</td>
                <td className="p-4 sm:p-5 text-zinc-400">Tiered per student</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-gradient-to-br from-orange-950/60 via-zinc-900 to-zinc-950 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Upgrade Your Chess Academy?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Experience the future of chess coaching. Start your 14-day free trial or book a tailored walkthrough with our coaching specialists.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="https://app.chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 transition"
            >
              Open Web App (app.chessplay.in)
            </a>
            <button
              onClick={() => setCurrentPage('contact')}
              className="px-8 py-3.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm border border-zinc-700 transition"
            >
              Schedule a Live Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
