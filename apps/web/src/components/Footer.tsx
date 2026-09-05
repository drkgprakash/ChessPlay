import React from 'react';
import { ArrowRight, ShieldCheck, Globe, Heart } from 'lucide-react';
import { PageId } from './Navbar';

interface FooterProps {
  setCurrentPage: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-12 text-zinc-400 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-xl">
                ♞
              </div>
              <span className="text-lg font-black text-white">
                Chess<span className="text-orange-500">Play</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              The modern, all-in-one software platform for chess coaches, clubs, and academies worldwide. Replace fragmented spreadsheets, WhatsApp, and Zoom with one unified experience.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hostinger High-Performance Enterprise Infrastructure</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Platform</h4>
            <button onClick={() => setCurrentPage('features')} className="text-left hover:text-white transition">
              Live Classroom
            </button>
            <button onClick={() => setCurrentPage('features')} className="text-left hover:text-white transition">
              Simul Multi-Board View
            </button>
            <button onClick={() => setCurrentPage('features')} className="text-left hover:text-white transition">
              Stockfish 16 NNUE AI Coach
            </button>
            <button onClick={() => setCurrentPage('features')} className="text-left hover:text-white transition">
              Swiss & Arena Tournaments
            </button>
            <button onClick={() => setCurrentPage('features')} className="text-left hover:text-white transition">
              Automated Homework & Puzzles
            </button>
          </div>

          {/* Comparisons */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Compare</h4>
            <button onClick={() => setCurrentPage('why-us')} className="text-left hover:text-white transition">
              Chess Play vs ChessPlay.io
            </button>
            <button onClick={() => setCurrentPage('why-us')} className="text-left hover:text-white transition">
              Chess Play vs Chesslang
            </button>
            <button onClick={() => setCurrentPage('why-us')} className="text-left hover:text-white transition">
              Why Switch to Chess Play?
            </button>
            <button onClick={() => setCurrentPage('pricing')} className="text-left hover:text-white transition">
              Transparent Pricing
            </button>
          </div>

          {/* Company & Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Company</h4>
            <button onClick={() => setCurrentPage('about')} className="text-left hover:text-white transition">
              About Us
            </button>
            <button onClick={() => setCurrentPage('blog')} className="text-left hover:text-white transition">
              Coaching Blog & Guides
            </button>
            <button onClick={() => setCurrentPage('contact')} className="text-left hover:text-white transition">
              Book a Demo
            </button>
            <a href="https://app.chessplay.in" target="_blank" rel="noreferrer" className="text-left text-orange-400 hover:underline font-semibold flex items-center gap-1">
              App Portal →
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Chess Play (chessplay.in). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-300 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
