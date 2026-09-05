import React from 'react';
import { Bot, Compass, GraduationCap, Trophy, FileText, CheckCircle2, ArrowRight, ShieldCheck, Zap, Laptop, Users, Sparkles } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface FeaturesPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ setCurrentPage }) => {
  const features = [
    {
      icon: <GraduationCap className="w-6 h-6 text-orange-400" />,
      title: "Interactive Live Classrooms",
      description: "A synchronized master board with piece locking, live annotation tools, and HD video chat. Switch between one-on-one coaching and group masterclasses with 1 click.",
      highlights: ["Coach Master Board", "Student Move Delegation", "Laser Pointer & Custom Arrows", "Built-in Audio/Video"]
    },
    {
      icon: <Users className="w-6 h-6 text-orange-400" />,
      title: "Simul Multi-Board Monitoring",
      description: "Unique to Chess Play: coach can view a real-time grid of all active student boards simultaneously during tactical drills, instantly pinpointing who needs help.",
      highlights: ["6-Board Simultaneous Grid", "Real-Time Move Stream", "Direct Board Jumping", "Instant Coach Intervention"]
    },
    {
      icon: <Bot className="w-6 h-6 text-orange-400" />,
      title: "Stockfish 16+ NNUE & Plain-English AI Coach",
      description: "Powered by modern WebAssembly for zero server lag and instant depth. Automatically classifies every move (Brilliant, Best, Inaccuracy, Blunder) and explains tactical mistakes in human words.",
      highlights: ["WebAssembly (0 Server Latency)", "Chess.com CAPS Accuracy %", "Multi-PV Top 3 Lines", "Tactical Motif Detection"]
    },
    {
      icon: <Trophy className="w-6 h-6 text-orange-400" />,
      title: "FIDE Swiss & Arena Tournaments",
      description: "Run official club tournaments effortlessly. Automated Swiss pairings with Buchholz Cut 1 and Sonneborn-Berger tie-break calculations, or high-energy Arena tournaments.",
      highlights: ["Official FIDE Tie-Break Rules", "Arena Streaks & Countdown", "Live Spectator Broadcast Link", "Automated Performance ELO"]
    },
    {
      icon: <FileText className="w-6 h-6 text-orange-400" />,
      title: "Automated WhatsApp Parent Reports",
      description: "Delight parents and double student retention with professional monthly progress reports delivered straight to their WhatsApp or Email.",
      highlights: ["1-Click WhatsApp Delivery", "Attendance & Rating Trends", "Coach Notes & Homework Stats", "Custom Academy Logo & Branding"]
    },
    {
      icon: <Compass className="w-6 h-6 text-orange-400" />,
      title: "Opening Explorer & Repertoire Studio",
      description: "Comprehensive opening database with ECO codes, master win percentages, and opening repertoire training so students never walk into opening traps.",
      highlights: ["10M+ Master Game Database", "ECO Codes & Opening Names", "Interactive Repertoire Drills", "Opening Weakness Detector"]
    }
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">All-in-One Architecture</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
          Everything Your Chess Academy Needs to Scale
        </h1>
        <p className="text-zinc-400 text-base mt-4 leading-relaxed">
          Explore the industry-leading features built specifically for modern chess coaches, academy owners, and passionate students.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-lg flex flex-col justify-between hover:border-orange-500/50 transition duration-300"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">{feat.description}</p>
            </div>

            <div className="pt-4 border-t border-zinc-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Key Highlights</span>
              <ul className="space-y-1.5 text-xs text-zinc-300 font-medium">
                {feat.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="mt-16 bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
        <h3 className="text-2xl font-bold text-white">Want to see these features in action?</h3>
        <p className="text-xs text-zinc-400 max-w-lg">
          Take a test drive on our live app or talk with our academy onboarding team.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <a
            href="https://app.chessplay.in"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition"
          >
            Open Web App Portal →
          </a>
          <button
            onClick={() => setCurrentPage('contact')}
            className="px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition"
          >
            Book Demo
          </button>
        </div>
      </div>
    </div>
  );
};
