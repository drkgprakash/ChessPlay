import React from 'react';
import { Target, Users, Shield, Award, Heart, Globe } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface AboutPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      {/* Top Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Our Mission</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
          Empowering the Next Generation of Chess Champions
        </h1>
        <p className="text-zinc-400 text-base mt-4 leading-relaxed">
          At <strong>Chess Play</strong>, we believe chess coaching is an art. Our mission is to give coaches and academies world-class tools to inspire young minds, streamline administration, and build thriving academies worldwide.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 text-xl">
            🎯
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Coach-First Design</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We don't build generic conferencing software. Every button, board gesture, and analysis metric is specifically tailored to how grandmasters and instructors teach students.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 text-xl">
            ⚡
          </div>
          <h3 className="text-lg font-bold text-white mb-2">State-of-the-Art Technology</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            From client-side multithreaded Stockfish 16 NNUE WebAssembly to ultra-smooth WebRTC video, we push the frontiers of web speed and reliability.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 text-xl">
            🌍
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Global Community</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Connecting coaches, students, and academies from India, the Americas, Europe, and Asia into a vibrant, supportive chess ecosystem.
          </p>
        </div>
      </div>

      {/* Team quote */}
      <div className="bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto">
        <span className="text-4xl text-orange-400">“</span>
        <blockquote className="text-lg sm:text-xl font-medium text-zinc-200 -mt-3 max-w-2xl mx-auto leading-relaxed">
          Our goal is to eliminate 100% of the administrative friction for coaches so they can focus on what they do best: developing grandmaster thinking and building character through chess.
        </blockquote>
        <div className="mt-6">
          <span className="font-bold text-white text-sm block">The Chess Play Core Team</span>
          <span className="text-xs text-zinc-400">chessplay.in • Bengaluru & Global</span>
        </div>
      </div>
    </div>
  );
};
