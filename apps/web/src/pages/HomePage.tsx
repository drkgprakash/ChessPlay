import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Trophy, 
  Users, 
  Star, 
  ShieldCheck, 
  Flame, 
  BookOpen, 
  ExternalLink,
  MessageCircle,
  CreditCard,
  Globe2,
  Cpu,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';
import { PageId } from '../components/Navbar';
import { ChessCoins3D } from '../components/ChessCoins3D';

interface HomePageProps {
  setCurrentPage: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState<'simul' | 'engine' | 'homework' | 'tournaments' | 'whatsapp'>('simul');
  const [studentCount, setStudentCount] = useState<number>(150);
  const [regionFocus, setRegionFocus] = useState<'india' | 'global'>('india');

  // ROI calculations
  const hoursSavedWeekly = Math.round((studentCount / 10) * 1.2);
  const monthlyAdminSavingsINR = Math.round(hoursSavedWeekly * 4 * 650);
  const monthlyAdminSavingsUSD = Math.round(hoursSavedWeekly * 4 * 25);

  return (
    <div className="flex flex-col font-sans bg-[#09090b] text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* =========================================================
          1. HERO SECTION WITH APPLE-LIKE 3D CHESS PIECES
      ========================================================= */}
      <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-28 border-b border-zinc-800/60">
        
        {/* Glow ambient background spotlights */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-500/15 via-amber-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[300px] bg-purple-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Target Audience Badge / Launch Offer Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-bold mb-8 shadow-sm backdrop-blur-md animate-in fade-in">
            <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-ping" />
            <span className="text-zinc-200">Limited Academy Launch:</span>
            <span className="text-amber-300 font-extrabold">3 Months Free + ₹0 Setup Fee</span>
            <span className="text-zinc-400 hidden sm:inline">•</span>
            <span className="text-zinc-300 hidden sm:inline">Indian & Global Academies</span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
            The Modern Operating System for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              High-Growth Chess Academies
            </span>
          </h1>

          {/* Subheading focused on coach & owner ROI */}
          <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-normal">
            Replace fragmented Zoom links, spreadsheets, and manual WhatsApp follow-ups with one unified platform. Interactive 6-board simuls, Grandmaster-grade AI analysis, auto-graded homework, Swiss tournaments, and 1-click WhatsApp progress reports.
          </p>

          {/* Interactive 3D Chess Coins Stage */}
          <div className="my-6 sm:my-8">
            <ChessCoins3D />
            <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mt-2">
              Move cursor or scroll to interact with 3D chess pieces
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <a
              href="https://app.chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white transition shadow-xl shadow-orange-500/25 transform hover:-translate-y-0.5"
            >
              <span>Start 14-Day Free Academy Trial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            
            <button
              onClick={() => setCurrentPage('contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition"
            >
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>Book a 1-on-1 Personalized Demo</span>
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-12 pt-8 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">150+</div>
              <div className="text-xs text-zinc-400 mt-0.5 font-medium">Academies Powered</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" /> India, US, UK, UAE
              </div>
            </div>

            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">12,400+</div>
              <div className="text-xs text-zinc-400 mt-0.5 font-medium">Active Students</div>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono">Across 18 Countries</div>
            </div>

            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">4.9 / 5.0</div>
              <div className="text-xs text-zinc-400 mt-0.5 font-medium">Coach Satisfaction</div>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono">Grandmaster Approved</div>
            </div>

            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">15+ Hrs</div>
              <div className="text-xs text-zinc-400 mt-0.5 font-medium">Weekly Admin Saved</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" /> Auto-Billing & Reports
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. TARGETED AUDIENCE SHOWCASE: INDIA & GLOBAL ACADEMIES
      ========================================================= */}
      <section className="py-20 border-b border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              Tailored For Your Academy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              Built for Academy Success in India & Across the Globe
            </h2>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Whether you run a premier chess school in Bangalore, Delhi, or Mumbai, or an international chess club in New York, London, or Dubai, Chess Play is engineered to automate your entire coaching operations.
            </p>

            {/* Region Switcher Tabs */}
            <div className="mt-6 inline-flex p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setRegionFocus('india')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  regionFocus === 'india'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🇮🇳 For Indian Chess Academies</span>
              </button>
              <button
                onClick={() => setRegionFocus('global')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  regionFocus === 'global'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🌍 For Global Chess Academies</span>
              </button>
            </div>
          </div>

          {/* Regional Feature Grid */}
          {regionFocus === 'india' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 border border-emerald-500/20">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Automated WhatsApp Parent Reports</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Indian parents love fast updates. Dispatch monthly performance cards, attendance streaks, and tactical puzzle scores directly to parents' WhatsApp in one click.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 98% Open Rate on WhatsApp
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4 border border-blue-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Instant UPI & INR Fee Collection</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Stop chasing monthly fee payments manually. Send automated UPI (Google Pay, PhonePe, Paytm) and Netbanking payment links with instant fee receipts.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-blue-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero Manual Fee Chasing
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 border border-amber-500/20">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">AICF & FIDE Rated Curriculum</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Structured syllabus from Beginner (800 ELO) to Candidate Master (2000+ ELO). 10,000+ interactive tactical positions mapped to Indian tournament standards.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-amber-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10,000+ Tactical Puzzles
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-4 border border-purple-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Multi-Coach Batch Operations</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Assign Head Coaches to conduct master demonstrations, while Assistant Coaches co-pilot the classroom, mark attendance, and evaluate student puzzle submissions.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-purple-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Role-Based Access Isolation
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-4 border border-indigo-500/20">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Multi-Currency Global Billing</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Charge parents in USD, EUR, GBP, AED, SGD, and AUD via automated recurring Stripe billing. Automatic tax invoices and credit card renewal retries.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-indigo-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 135+ Currencies Supported
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 border border-emerald-500/20">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Timezone-Smart Scheduling</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Coaching students across North America, Europe, and Asia? Chess Play converts batch timings automatically to each student's local timezone with Google Calendar sync.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero Missed Group Classes
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4 border border-amber-500/20">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">FIDE-Standard Swiss Tournaments</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Host official academy tournaments with automated Buchholz tiebreaks, Swiss Dutch pairing algorithms, and instantaneous PGN/FEN downloads.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-amber-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> FIDE Dutch Pairing Engine
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-4 border border-purple-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Custom Academy Branding</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Your brand is front and center. Upload your academy logo, brand colors, custom subdomain, and issue co-branded student completion certificates.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-purple-400 font-mono font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> White-Label Portal Ready
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================
          3. CORE PRODUCT PILLARS: INTERACTIVE DEMO STAGE
      ========================================================= */}
      <section className="py-20 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              Coaching Technology
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2 tracking-tight">
              Replace 5 Disconnected Tools with 1 Chess OS
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              Explore how Chess Play powers every touchpoint between coaches, students, and parents.
            </p>

            {/* Feature Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 w-fit mx-auto">
              <button
                onClick={() => setActiveTab('simul')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'simul' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> 6-Board Live Simul
              </button>
              <button
                onClick={() => setActiveTab('engine')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'engine' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" /> Grandmaster AI Coach
              </button>
              <button
                onClick={() => setActiveTab('homework')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'homework' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Auto-Graded Homework
              </button>
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'tournaments' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" /> Swiss Tournaments
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'whatsapp' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Reports
              </button>
            </div>
          </div>

          {/* Interactive Feature Display Card */}
          <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-10 shadow-2xl">
            {activeTab === 'simul' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                    Classroom Feature
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Simultaneous 6-Board Master Classroom
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Coaching a group of students online shouldn't mean sharing screens over Zoom. The Head Coach conducts master lessons on the central demonstration board while monitoring up to 6 student boards playing simultaneously in real-time.
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Board Lock & Spotlight:</strong> Prevent students from making illegal or premature moves.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Blunder Radar:</strong> Visual coach indicator highlights when a student makes a critical mistake.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Arrow & Square Annotations:</strong> Draw multi-colored tactical arrows and square highlights.</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <a
                      href="https://app.chessplay.in"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition"
                    >
                      <span>Explore Classroom in App</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Visual Representation */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Simul Grid: 6 Boards Active
                    </span>
                    <span className="text-zinc-500 font-mono">Coach: GM Vikram Sen</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { student: 'Aarav S. (1640)', eval: '+1.4', status: 'Thinking' },
                      { student: 'Diya P. (1580)', eval: '-0.8', status: 'Blunder Alert' },
                      { student: 'Rohan I. (1520)', eval: '+2.1', status: 'Winning' },
                      { student: 'Ananya K. (1480)', eval: '0.0', status: 'Drawish' },
                      { student: 'Kabir M. (1610)', eval: '+3.6', status: 'Mating Net' },
                      { student: 'Ishaan T. (1550)', eval: '-1.2', status: 'In Danger' },
                    ].map((b, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border text-center ${
                        b.status === 'Blunder Alert' 
                          ? 'bg-red-500/10 border-red-500/40 text-red-300' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}>
                        <div className="w-full h-16 bg-zinc-950 rounded-lg flex items-center justify-center text-xl font-bold border border-zinc-800">
                          {i % 2 === 0 ? '♞ vs ♙' : '♛ vs ♚'}
                        </div>
                        <div className="text-[11px] font-bold mt-1.5 truncate">{b.student}</div>
                        <div className="text-[9px] font-mono text-zinc-500 mt-0.5">{b.eval} • {b.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'engine' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                    AI Coaching
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Grandmaster-Grade AI Analysis (3500+ ELO)
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Equip your students and coaches with real-time deep tactical evaluation. Every move is categorized with Chess.com-style brilliance badges, allowing students to learn *why* an alternative was stronger.
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Move Classification:</strong> Instant badges for Brilliant, Great, Best, Inaccuracy, Mistake, and Blunder.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>AI Coach Commentary:</strong> Human-readable strategic advice for why a move wins or loses.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Zero Lag Execution:</strong> Instant evaluations calculated in milliseconds right on the student's device.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Analysis Studio Preview</span>
                    <span className="text-emerald-400 font-mono font-bold">Evaluation: +2.85</span>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <div className="text-xs font-bold text-orange-400">Brilliant Move !! (22... Rxe3!!)</div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Rook sacrifice opens White's king shelter, creating an unavoidable mate in 4.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono flex justify-between text-zinc-400">
                    <span>Depth: 26 plies</span>
                    <span>Nodes: 3.4M nps</span>
                    <span>Threat: Qh4+</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'homework' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                    Automated LMS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Automated Homework & Puzzle Streaks
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Assigning tactics from PDF sheets and grading student moves by hand is obsolete. Coaches schedule interactive tactical homework batches that automatically verify move accuracy.
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Custom Position Editor:</strong> Paste FEN or drag pieces to create unique academy homework.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Instant Auto-Grading:</strong> Students receive immediate feedback with solution branching.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Streak Gamification:</strong> Students unlock badges, fostering consistent daily practice habits.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-white">Homework Batch: Advanced Tactics</div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span>1. Pin & Skewer Defenses</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">94% Solved</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span>2. Back-Rank Mating Nets</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">88% Solved</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span>3. Rook Endgame Lucena Position</span>
                      <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px]">Due in 2 days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                    Tournament Director
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    FIDE-Standard Swiss & Arena Tournaments
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Host weekend academy championships and inter-school tournaments effortlessly. The system automatically computes pairings, prevents color imbalances, and publishes live leaderboards.
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Swiss Dutch System:</strong> Automated round pairings without manual bracket calculations.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Arena Rapid Play:</strong> Fast-paced continuous pairing format for club practice nights.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Exportable PGNs:</strong> Full tournament game records for post-game coach analysis.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Live Leaderboard: Academy Winter Swiss</span>
                    <span className="text-orange-400 font-mono text-[10px]">Round 4 of 5</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 text-zinc-200">
                      <span>1. Aarav S. (1640)</span>
                      <span className="text-emerald-400 font-bold">4.0 / 4.0</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 text-zinc-200">
                      <span>2. Diya P. (1580)</span>
                      <span className="text-emerald-400 font-bold">3.5 / 4.0</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 text-zinc-200">
                      <span>3. Kabir M. (1610)</span>
                      <span className="text-emerald-400 font-bold">3.0 / 4.0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                    Parent Retention
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Automated WhatsApp Progress Reports
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Retain students by keeping parents engaged and informed. Send monthly report cards containing attendance percentages, homework completion rates, rating growth graphs, and personalized coach feedback.
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Zero Typing:</strong> Performance data compiles automatically from classroom records.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Parent Transparency:</strong> Dramatically reduces student drop-offs and improves parent referrals.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span><strong>Co-Branded Design:</strong> Delivered with your academy's logo, colors, and coach signature.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <MessageCircle className="w-4 h-4" /> WhatsApp Dispatch Preview
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-sans">
                      "Dear Mrs. Sharma, Aarav attended <strong>96%</strong> of his Batch Alpha masterclasses this month and completed <strong>12/12</strong> tactical homework assignments with an accuracy of <strong>94%</strong>. Rating: <strong>1640 (+45)</strong>. Coach Remark: Excellent understanding of central pawn breaks."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* =========================================================
          4. INTERACTIVE ROI CALCULATOR FOR ACADEMY DIRECTORS
      ========================================================= */}
      <section className="py-20 border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
            Academy ROI Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
            See How Much Time & Revenue You Save Every Month
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
            Drag the slider below to match your current enrolled student count:
          </p>

          <div className="mt-10 p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 max-w-2xl mx-auto shadow-2xl space-y-8">
            
            {/* Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-zinc-300">Total Enrolled Students:</span>
                <span className="text-2xl font-black text-orange-400 font-mono">{studentCount} Students</span>
              </div>
              <input
                type="range"
                min="20"
                max="600"
                step="10"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-2">
                <span>20 Students</span>
                <span>200 Students</span>
                <span>600+ Students</span>
              </div>
            </div>

            {/* Calculations Output */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-left">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-xs text-zinc-400 font-medium">Coach & Admin Time Saved</span>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  {hoursSavedWeekly} hrs<span className="text-xs text-zinc-500 font-normal"> / week</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                  ~{hoursSavedWeekly * 4} hours saved / month
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-xs text-zinc-400 font-medium">Monthly Efficiency Unlocked</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
                  ₹{monthlyAdminSavingsINR.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
                  ~${monthlyAdminSavingsUSD.toLocaleString()} USD / month
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={() => setCurrentPage('contact')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <span>Unlock This Growth for Your Academy →</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          5. ACADEMY TESTIMONIALS & TRUST
      ========================================================= */}
      <section className="py-20 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              Trusted Worldwide
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              What Academy Directors Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "The 6-board simul feature completely changed our online group training. Our coaches can immediately spot which student is blundering without having to ask for screenshots."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                  GM
                </div>
                <div>
                  <div className="text-xs font-bold text-white">GM Vikram Sen</div>
                  <div className="text-[11px] text-zinc-500">Achiever's Chess Academy, India</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "Our parent retention increased by 30% after we enabled automated WhatsApp progress cards. Parents feel deeply connected with their child's chess milestones."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  WFM
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Pooja Sharma</div>
                  <div className="text-[11px] text-zinc-500">KnightSquad Chess Club, Bangalore</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "Scheduling international classes across UK and US timezones with recurring Stripe billing saved us over 20 hours every single month. Highly recommended."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  IM
                </div>
                <div>
                  <div className="text-xs font-bold text-white">David Miller</div>
                  <div className="text-[11px] text-zinc-500">Metropolitan Chess, London & New York</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          6. FINAL CALL TO ACTION: SPECIAL LAUNCH OFFER
      ========================================================= */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claim Your 14-Day Free Trial Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Take Your Chess Academy to the Grandmaster Level?
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Join 150+ leading academies in India and globally. Get instant access to the classroom simul, AI engine, auto-homework, and WhatsApp progress cards.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.chessplay.in"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-9 py-4 text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white transition shadow-xl shadow-orange-500/30 transform hover:-translate-y-0.5"
            >
              <span>Get Started Free (No Credit Card Required)</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setCurrentPage('contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition"
            >
              <span>Schedule VIP Onboarding Walkthrough</span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 pt-2 font-mono">
            Setup takes less than 3 minutes • Import existing students via CSV or WhatsApp list
          </p>
        </div>
      </section>

    </div>
  );
};
