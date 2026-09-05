import React, { useState } from 'react';
import { ArrowRight, Menu, X, Sparkles, ExternalLink } from 'lucide-react';

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
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (id: PageId) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>New: Stockfish 16+ NNUE & Simul Multi-Board Grid are now live!</span>
        <a
          href="https://app.chessplay.in"
          target="_blank"
          rel="noreferrer"
          className="underline font-bold hover:text-orange-100 flex items-center gap-0.5 ml-1"
        >
          Try Web App <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-[#0e0d0b]/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 text-2xl font-black">
              ♞
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Chess<span className="text-orange-500">Play</span>
              </span>
              <span className="text-[10px] text-zinc-400 block font-medium -mt-1">
                For Coaches & Academies
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`transition-colors ${
                  currentPage === link.id
                    ? 'text-orange-400'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://app.chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-zinc-300 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition flex items-center gap-1"
            >
              Sign In to App <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => handleNav('contact')}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition shadow-lg shadow-orange-500/25"
            >
              Request Free Demo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-5 flex flex-col gap-4 text-sm font-semibold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-left py-1 transition ${
                  currentPage === link.id ? 'text-orange-400 font-bold' : 'text-zinc-400'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              <a
                href="https://app.chessplay.in"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-200"
              >
                Open App (app.chessplay.in)
              </a>
              <button
                onClick={() => handleNav('contact')}
                className="w-full text-center py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white shadow-md"
              >
                Book a Free Demo
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
