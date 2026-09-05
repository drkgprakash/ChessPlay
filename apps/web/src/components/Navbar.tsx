import React, { useState } from 'react';
import { ArrowRight, Menu, X, Sparkles, ExternalLink, Gift, ShieldCheck } from 'lucide-react';

export type PageId = 'home' | 'features' | 'why-us' | 'pricing' | 'blog' | 'about' | 'contact';

interface NavbarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'why-us', label: 'Why Chess Play' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact & Demo' },
  ];

  const handleNav = (id: PageId) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* High-Converting Targeted Academy Launch Offer Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white text-xs font-medium py-2.5 px-4 text-center flex flex-wrap items-center justify-center gap-2 shadow-sm relative z-50">
        <span className="bg-black/30 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold text-amber-200 border border-amber-300/30 flex items-center gap-1">
          <Gift className="w-3 h-3 text-amber-300" /> Academy Launch Special
        </span>
        <span className="text-zinc-100">
          Get <strong className="text-white font-bold">3 Months Free + ₹0 Setup Fee</strong> for Indian & Global Chess Academies!
        </span>
        <button
          onClick={() => handleNav('pricing')}
          className="underline font-bold text-amber-100 hover:text-white transition inline-flex items-center gap-1 ml-1 cursor-pointer"
        >
          Claim 14-Day Free Trial →
        </button>
      </div>

      {/* Main Luxury Navbar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform text-2xl font-black">
              ♞
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Chess<span className="text-orange-500">Play</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                Academy OS
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-full border border-zinc-800/80">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  currentPage === link.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => handleNav('contact')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
            >
              Book Live Demo
            </button>
            <a
              href="https://app.chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white transition shadow-lg shadow-orange-500/25 flex items-center gap-1.5"
            >
              <span>Academy Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    currentPage === link.id
                      ? 'bg-orange-500 text-white font-bold shadow'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-2.5">
              <button
                onClick={() => handleNav('contact')}
                className="w-full py-3 rounded-xl text-xs font-bold text-center text-zinc-200 bg-zinc-900 border border-zinc-800"
              >
                Book 1-on-1 Demo
              </button>
              <a
                href="https://app.chessplay.in"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl text-xs font-bold text-center text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <span>Launch Academy App</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
