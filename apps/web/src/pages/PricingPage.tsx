import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface PricingPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ setCurrentPage }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Simple, Transparent Plans</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
          Coaching Software That Pays for Itself
        </h1>
        <p className="text-zinc-400 text-base mt-4 leading-relaxed">
          No hidden fees, no complicated student limits. Scale your academy with confidence.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition ${
              !isAnnual ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              isAnnual ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        {/* Starter Plan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Starter Coach</span>
            <h3 className="text-xl font-bold text-white mt-1">Solo Instructor</h3>
            <p className="text-xs text-zinc-400 mt-2">Ideal for independent coaches starting out.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{isAnnual ? '$39' : '$49'}</span>
              <span className="text-xs text-zinc-500">/ month</span>
            </div>

            <ul className="mt-8 space-y-3 text-xs text-zinc-300 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 35 Active Students
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Coach Account
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Stockfish 16 NNUE Engine
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Interactive Live Classrooms
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Auto-Graded Puzzles
              </li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentPage('contact')}
            className="mt-8 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
          >
            Start 14-Day Free Trial
          </button>
        </div>

        {/* Pro Plan (Featured) */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-orange-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
            Most Popular Academy Plan
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Academy Pro</span>
            <h3 className="text-xl font-bold text-white mt-1">Growing Academy</h3>
            <p className="text-xs text-zinc-400 mt-2">Unlimited students & coaches. Everything unlocked.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{isAnnual ? '$79' : '$89'}</span>
              <span className="text-xs text-zinc-500">/ month</span>
            </div>

            <ul className="mt-8 space-y-3 text-xs text-zinc-200 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> <strong>Unlimited Students</strong>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> <strong>Unlimited Coaches</strong>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> Simul Multi-Board 6-Grid View
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> Plain-English AI Coach Insights
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> FIDE Swiss & Arena Tournaments
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> Automated WhatsApp Parent Cards
              </li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentPage('contact')}
            className="mt-8 w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-lg shadow-orange-500/30"
          >
            Get Started Now
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Enterprise Franchise</span>
            <h3 className="text-xl font-bold text-white mt-1">Multi-Branch Chain</h3>
            <p className="text-xs text-zinc-400 mt-2">Custom domains, white-labeling, and dedicated support.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{isAnnual ? '$149' : '$179'}</span>
              <span className="text-xs text-zinc-500">/ month</span>
            </div>

            <ul className="mt-8 space-y-3 text-xs text-zinc-300 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Branch Branch Management
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Custom Domain (e.g. app.youracademy.com)
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> White-Labeled iOS & Android App Option
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated Account Manager
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Custom Curriculum Data Migration
              </li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentPage('contact')}
            className="mt-8 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
          >
            Contact Enterprise Sales
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h4 className="font-bold text-white">Can I import my existing students and PGN databases?</h4>
            <p className="mt-2 text-zinc-400 leading-relaxed">
              Yes! You can import student rosters via CSV or Excel in seconds. You can also import any PGN or FEN database into the study library.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h4 className="font-bold text-white">How does Chess Play perform on student tablets and smartphones?</h4>
            <p className="mt-2 text-zinc-400 leading-relaxed">
              Chess Play is fully responsive and touch-optimized. Students can join classes, solve homework puzzles, and play tournaments seamlessly from iPads, Android tablets, laptops, and phones.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h4 className="font-bold text-white">Is there any long-term contract?</h4>
            <p className="mt-2 text-zinc-400 leading-relaxed">
              No long-term commitments. You can cancel or modify your subscription at any time with 1 click in your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
