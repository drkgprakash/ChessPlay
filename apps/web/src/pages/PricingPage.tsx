import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, HelpCircle, Gift, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface PricingPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ setCurrentPage }) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const pricing = {
    INR: {
      symbol: '₹',
      starter: isAnnual ? '2,499' : '2,999',
      pro: isAnnual ? '5,499' : '6,999',
      enterprise: isAnnual ? '11,999' : '14,999',
      period: '/ month',
      badge: 'UPI, Net Banking & Cards Supported'
    },
    USD: {
      symbol: '$',
      starter: isAnnual ? '29' : '39',
      pro: isAnnual ? '69' : '89',
      enterprise: isAnnual ? '159' : '199',
      period: '/ month',
      badge: 'Stripe International Cards (USD, EUR, GBP)'
    }
  };

  const curr = pricing[currency];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Banner Offer */}
      <div className="mb-10 max-w-2xl mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 flex items-center justify-center gap-2.5 text-center text-xs text-zinc-200">
        <Gift className="w-4 h-4 text-orange-400 shrink-0" />
        <span>
          <strong>Academy Launch Offer:</strong> Get <strong>3 Months Free + ₹0 / $0 Setup Fee</strong> on all Annual Academy Plans!
        </span>
      </div>

      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Simple, Transparent Plans</span>
        <h1 className="text-4xl sm:text-5xl font-black text-white mt-2 tracking-tight">
          Coaching Software That Pays for Itself
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base mt-4 leading-relaxed">
          No hidden fees, no student limits on Pro plans. Designed for high-performing academies in India and worldwide.
        </p>

        {/* Currency & Annual Billing Toggles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          
          {/* Currency Toggle */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                currency === 'INR' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              🇮🇳 INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                currency === 'USD' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              🌍 USD ($)
            </button>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                !isAnnual ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isAnnual ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono mt-3">
          {curr.badge}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        
        {/* Starter Plan */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Solo Instructor</span>
            <h3 className="text-xl font-bold text-white mt-1">Starter Coach</h3>
            <p className="text-xs text-zinc-400 mt-2">Ideal for independent coaches with up to 35 students.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white font-mono">{curr.symbol}{curr.starter}</span>
              <span className="text-xs text-zinc-500">{curr.period}</span>
            </div>

            <ul className="mt-8 space-y-3 text-xs text-zinc-300 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 35 Active Students
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Coach Master Account
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Grandmaster-Grade AI Analysis
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Interactive Live Master Board
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Automated Tactics Homework
              </li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentPage('contact')}
            className="mt-8 w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
          >
            Start 14-Day Free Trial
          </button>
        </div>

        {/* Pro Plan (Featured) */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-orange-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
            Most Popular Academy Choice
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Growing Academy</span>
            <h3 className="text-xl font-bold text-white mt-1">Academy Pro</h3>
            <p className="text-xs text-zinc-400 mt-2">Unlimited students & coaches. Everything unlocked.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white font-mono">{curr.symbol}{curr.pro}</span>
              <span className="text-xs text-zinc-500">{curr.period}</span>
            </div>

            <ul className="mt-8 space-y-3 text-xs text-zinc-200 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> <strong>Unlimited Students & Batches</strong>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> <strong>Unlimited Head & Assistant Coaches</strong>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> Simul Multi-Board 6-Grid View
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> Automated WhatsApp Parent Progress Reports
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> FIDE-Standard Swiss & Arena Tournaments
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-orange-400 shrink-0" /> Automated Fee Invoicing & Tracking
              </li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentPage('contact')}
            className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs transition shadow-lg shadow-orange-500/30"
          >
            Claim 14-Day VIP Trial →
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Multi-Branch Chain</span>
            <h3 className="text-xl font-bold text-white mt-1">Enterprise Franchise</h3>
            <p className="text-xs text-zinc-400 mt-2">Custom domains, white-label branding, and dedicated support.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white font-mono">{curr.symbol}{curr.enterprise}</span>
              <span className="text-xs text-zinc-500">{curr.period}</span>
            </div>

            <ul className="mt-8 space-y-3 text-xs text-zinc-300 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Multiple Academy Branches / Franchise
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Custom Domain (e.g. app.youracademy.com)
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> 100% White-Label Branding & Certificates
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated Account Manager
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Custom WhatsApp API Gateway
              </li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentPage('contact')}
            className="mt-8 w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
          >
            Talk to Enterprise Team
          </button>
        </div>

      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto pt-8 border-t border-zinc-800">
        <h3 className="text-xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h4 className="text-sm font-bold text-white">Can I import my existing student roster from Excel or WhatsApp?</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Yes! You can upload a simple CSV spreadsheet or our team can assist you in migrating your active batches within minutes with zero downtime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h4 className="text-sm font-bold text-white">How does the 14-day free trial work?</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              You get immediate access to all features (including live simul, AI analysis, and WhatsApp reports). No credit card required to start.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <h4 className="text-sm font-bold text-white">Do you support Indian payment methods like UPI?</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Yes. We support automated UPI (PhonePe, Google Pay, Paytm), Net Banking, and Indian credit/debit cards, as well as international cards via Stripe.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
