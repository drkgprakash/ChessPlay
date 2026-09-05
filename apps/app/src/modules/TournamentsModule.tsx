import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Clock, Flame, Shield, Award, Play, ChevronRight, 
  Plus, MessageSquare, RefreshCw, CheckCircle2, ChevronLeft, 
  Sparkles, Crown, Share2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { 
  tournamentService, 
  Tournament, 
  TournamentPlayer, 
  TournamentMatch 
} from '../services/tournamentService';
import { CreateTournamentModal } from '../components/CreateTournamentModal';

export const TournamentsModule: React.FC = () => {
  const { user, token } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('tourn-01');
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<TournamentPlayer[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [availableRounds, setAvailableRounds] = useState<number[]>([1, 2, 3]);
  const [selectedRound, setSelectedRound] = useState<number>(3);

  const [activeTab, setActiveTab] = useState<'standings' | 'pairings'>('standings');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingResult, setIsSubmittingResult] = useState<string | null>(null);
  const [isAdvancingRound, setIsAdvancingRound] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load tournaments list
  const loadTournaments = async (selectId?: string) => {
    if (!token) return;
    try {
      const list = await tournamentService.getTournaments(token);
      setTournaments(list);
      if (list.length > 0) {
        const idToSelect = selectId || (list.some(t => t.id === selectedTournamentId) ? selectedTournamentId : list[0].id);
        setSelectedTournamentId(idToSelect);
      }
    } catch {
      // Fallback
    }
  };

  // Load specific tournament details and round pairings
  const loadTournamentDetails = async (tournamentId: string, round?: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await tournamentService.getTournamentDetail(token, tournamentId, round);
      setCurrentTournament(data.tournament);
      setStandings(data.standings || []);
      setMatches(data.matches || []);
      setAvailableRounds(data.available_rounds || [1]);
      setSelectedRound(data.selected_round);
    } catch {
      // Handled in service fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, [token]);

  useEffect(() => {
    if (selectedTournamentId) {
      loadTournamentDetails(selectedTournamentId, selectedRound);
    }
  }, [selectedTournamentId, token]);

  const handleRoundChange = (rnd: number) => {
    setSelectedRound(rnd);
    loadTournamentDetails(selectedTournamentId, rnd);
  };

  // Record match result (1-0, 0-1, 1/2-1/2)
  const handleRecordResult = async (matchId: string, result: '1-0' | '0-1' | '1/2-1/2') => {
    if (!token) return;
    setIsSubmittingResult(matchId);
    setStatusMessage(null);

    const res = await tournamentService.recordMatchResult(token, matchId, result);
    if (res.status === 'success') {
      setStatusMessage({ type: 'success', text: `Result ${result} recorded! Standings & Buchholz updated.` });
      // Reload round and standings
      await loadTournamentDetails(selectedTournamentId, selectedRound);
    } else {
      setStatusMessage({ type: 'error', text: res.message || 'Failed to record result' });
    }
    setIsSubmittingResult(null);
  };

  // Advance to next round using FIDE Swiss Algorithm
  const handleAdvanceNextRound = async () => {
    if (!token || !currentTournament) return;
    
    // Check if any ongoing matches in current round
    const pendingMatches = matches.filter(m => !m.result || m.result === '*');
    if (pendingMatches.length > 0) {
      const proceed = window.confirm(
        `There are still ${pendingMatches.length} match(es) pending in Round ${selectedRound}. Are you sure you want to pair the next round?`
      );
      if (!proceed) return;
    }

    setIsAdvancingRound(true);
    setStatusMessage(null);

    const res = await tournamentService.advanceNextRound(token, currentTournament.id);
    if (res.status === 'success') {
      setStatusMessage({ 
        type: 'success', 
        text: res.message || `Round ${res.round_number} pairings generated via FIDE Swiss pairing engine!` 
      });
      await loadTournaments(currentTournament.id);
      if (res.round_number) {
        setSelectedRound(res.round_number);
        await loadTournamentDetails(currentTournament.id, res.round_number);
      } else {
        await loadTournamentDetails(currentTournament.id);
      }
      setActiveTab('pairings');
    } else {
      setStatusMessage({ type: 'error', text: res.message || 'Error generating next round' });
    }
    setIsAdvancingRound(false);
  };

  // WhatsApp Tournament Bulletin
  const handleShareWhatsApp = () => {
    if (!currentTournament) return;

    const top3 = standings.slice(0, 3);
    const standingsList = standings
      .slice(0, 8)
      .map((s, idx) => `${idx + 1}. ${s.name} — *${s.score} pts* (BH: ${s.buchholz})`)
      .join('\n');

    const matchesList = matches
      .map(m => `• T#${m.table_number}: ${m.white_name} vs ${m.black_name || 'BYE'} [${m.result && m.result !== '*' ? m.result : 'Live'}]`)
      .join('\n');

    const bulletin = `🏆 *${currentTournament.title}* ♟️
*Format:* ${currentTournament.format.toUpperCase()} (${currentTournament.time_control})
*Status:* Round ${currentTournament.current_round} of ${currentTournament.total_rounds} ${currentTournament.status === 'completed' ? '• COMPLETED' : '• IN PROGRESS'}

🥇 *Top Leaders:*
${top3.map((p, i) => `${['🥇', '🥈', '🥉'][i]} *${p.name}* — ${p.score} pts`).join('\n')}

📊 *Current Standings (FIDE Swiss):*
${standingsList}

⚔️ *Round ${selectedRound} Pairings:*
${matchesList}

_Live Updates via Chess Play Academy OS_`;

    const encoded = encodeURIComponent(bulletin);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const topThree = standings.slice(0, 3);
  const isCompleted = currentTournament?.status === 'completed';
  const isLastRound = currentTournament && currentTournament.current_round >= currentTournament.total_rounds;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls: Tournament Switcher & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Tournament Organizer
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                FIDE Swiss Engine
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Automated Swiss pairings, Buchholz & Sonneborn-Berger tie-breaks, and live bulletins
            </p>
          </div>
        </div>

        {/* Tournament Switcher & New Tournament Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedTournamentId}
            onChange={(e) => {
              setSelectedTournamentId(e.target.value);
              setSelectedRound(3);
            }}
            className="bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500/50 flex-1 sm:flex-none sm:w-64"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status === 'completed' ? 'Done' : `R${t.current_round}/${t.total_rounds}`})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Tournament
          </button>
        </div>
      </div>

      {/* Notification status banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-zinc-400 hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tournament Banner Card */}
      {currentTournament && (
        <div className="bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-3xl shadow-inner">
              {isCompleted ? '👑' : '♟️'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-white">{currentTournament.title}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 capitalize">
                  FIDE {currentTournament.format.replace('_', ' ')} • {currentTournament.total_rounds} Rounds
                </span>
                {isCompleted ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    🏆 Tournament Concluded
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 animate-pulse">
                    Round {currentTournament.current_round} in Progress
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-400 mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-400" /> {currentTournament.time_control}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-400" /> {standings.length} Qualified Players
                </span>
                {currentTournament.batch_name && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-300 font-medium">{currentTournament.batch_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Bulletin Share and Live Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition flex items-center gap-2 shadow-sm"
              title="Broadcast standings and pairings to Academy WhatsApp Group"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp Bulletin
            </button>

            <button
              onClick={() => loadTournamentDetails(selectedTournamentId, selectedRound)}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Podium Celebration Cards for Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md hover:border-zinc-700 transition">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-2xl">
              🥈
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">2nd Place</div>
              <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                <span>{topThree[1].avatar_emoji || '👧'}</span> {topThree[1].name}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                <span className="text-orange-400 font-bold font-mono">{topThree[1].score} pts</span> • BH {topThree[1].buchholz}
              </div>
            </div>
          </div>

          {/* 1st Place Champion */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-xl shadow-amber-500/5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
              🥇
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1">
                <Crown className="w-3 h-3 fill-amber-400" /> Tournament Leader
              </div>
              <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                <span>{topThree[0].avatar_emoji || '👦'}</span> {topThree[0].name}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                <span className="text-amber-400 font-bold font-mono text-sm">{topThree[0].score} pts</span> • Perf {topThree[0].performance_rating}
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-md hover:border-zinc-700 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-900/20 border border-amber-800/40 flex items-center justify-center text-2xl">
              🥉
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">3rd Place</div>
              <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                <span>{topThree[2].avatar_emoji || '🧑'}</span> {topThree[2].name}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                <span className="text-orange-400 font-bold font-mono">{topThree[2].score} pts</span> • BH {topThree[2].buchholz}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === 'standings'
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Award className="w-4 h-4" />
              Current Standings (FIDE Tie-Breaks)
            </button>
            <button
              onClick={() => setActiveTab('pairings')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === 'pairings'
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Pairings & Live Results (Round {selectedRound})
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span>Official Tie-Break Order:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-semibold">
              1. Points &gt; 2. Buchholz &gt; 3. Sonneborn-Berger
            </span>
          </div>
        </div>

        {/* Tab 1: Current Standings Table */}
        {activeTab === 'standings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Player</th>
                  <th className="py-3 px-3 text-center">Rating</th>
                  <th className="py-3 px-3 text-center">Score (Pts)</th>
                  <th className="py-3 px-3 text-center">Buchholz</th>
                  <th className="py-3 px-3 text-center">Sonneborn-Berger</th>
                  <th className="py-3 px-3 text-center">Streak</th>
                  <th className="py-3 px-3 text-center">Perf. Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {standings.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-3">
                      {idx === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center text-sm">🥇</span>
                      ) : idx === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-zinc-400/20 text-zinc-300 font-bold flex items-center justify-center text-sm">🥈</span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold flex items-center justify-center text-sm">🥉</span>
                      ) : (
                        <span className="text-zinc-500 font-bold pl-2">{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{p.avatar_emoji || '👤'}</span>
                        <div>
                          <div className="font-bold text-zinc-100">{p.name}</div>
                          {p.fide_id && (
                            <div className="text-[10px] text-zinc-500 font-mono">{p.fide_id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-zinc-400 font-medium">
                      {p.rating}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-orange-400 text-sm">
                      {Number(p.score).toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                      {Number(p.buchholz).toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-zinc-400">
                      {Number(p.sonneborn_berger || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {p.streak > 0 ? (
                        <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {p.streak}
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400">
                      {p.performance_rating || p.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Pairings & Live Match Results */}
        {activeTab === 'pairings' && (
          <div className="flex flex-col gap-5">
            {/* Round Navigator & Swiss Generator Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 mr-1">Rounds:</span>
                {availableRounds.map((rnd) => (
                  <button
                    key={rnd}
                    onClick={() => handleRoundChange(rnd)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedRound === rnd
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Round {rnd}
                  </button>
                ))}
              </div>

              {/* Swiss Pairing Next Round Button */}
              {!isCompleted && selectedRound === currentTournament?.current_round && (
                <button
                  onClick={handleAdvanceNextRound}
                  disabled={isAdvancingRound}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {isAdvancingRound ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Pairing Swiss Roster...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isLastRound ? 'Conclude Tournament' : `Pair Round ${selectedRound + 1} (FIDE Swiss)`}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Pairings Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => {
                const isBye = Boolean(match.is_bye);
                const hasResult = match.result && match.result !== '*';

                return (
                  <div
                    key={match.id}
                    className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3.5 hover:border-zinc-700/80 transition shadow-sm"
                  >
                    {/* Header: Table # and Result Badge */}
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                          Table #{match.table_number}
                        </span>
                        {isBye && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                            FIDE BYE (+1.0 pt)
                          </span>
                        )}
                      </div>

                      <div>
                        {hasResult ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            match.result === '1-0'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : match.result === '0-1'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {match.result === '1-0' && 'White Won (1 - 0)'}
                            {match.result === '0-1' && 'Black Won (0 - 1)'}
                            {match.result === '1/2-1/2' && 'Draw (½ - ½)'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20 animate-pulse">
                            Game in Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Opponents Matchup Row */}
                    <div className="flex items-center justify-between py-1 bg-zinc-900/50 rounded-xl px-3 border border-zinc-800/60">
                      {/* White Side */}
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-zinc-200 text-black flex items-center justify-center font-bold text-sm shadow">
                          ♔
                        </span>
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{match.white_avatar || '👦'}</span> {match.white_name}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {match.white_rating} ELO
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-black text-zinc-500 font-mono px-2">VS</span>

                      {/* Black Side */}
                      <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                        <span className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-sm border border-zinc-700 shadow">
                          ♚
                        </span>
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5 flex-row-reverse">
                            <span>{match.black_avatar || '👦'}</span> {match.black_name || 'BYE'}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {isBye ? 'Automatic 1 Point' : `${match.black_rating || 1400} ELO`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Result Submission Controls (Coach Action) */}
                    {!isBye && (
                      <div className="pt-1 flex flex-col gap-1.5">
                        <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                          Record Match Outcome:
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleRecordResult(match.id, '1-0')}
                            disabled={isSubmittingResult === match.id}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                              match.result === '1-0'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60'
                            }`}
                          >
                            1 - 0 (White)
                          </button>
                          <button
                            onClick={() => handleRecordResult(match.id, '1/2-1/2')}
                            disabled={isSubmittingResult === match.id}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                              match.result === '1/2-1/2'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60'
                            }`}
                          >
                            ½ - ½ (Draw)
                          </button>
                          <button
                            onClick={() => handleRecordResult(match.id, '0-1')}
                            disabled={isSubmittingResult === match.id}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                              match.result === '0-1'
                                ? 'bg-sky-600 text-white shadow-md'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60'
                            }`}
                          >
                            0 - 1 (Black)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* New Tournament Creation Modal */}
      {showCreateModal && token && (
        <CreateTournamentModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onCreated={(newId) => {
            loadTournaments(newId);
            setSelectedTournamentId(newId);
            setSelectedRound(1);
            setStatusMessage({
              type: 'success',
              text: 'New tournament created successfully! Round 1 pairings have been seeded.'
            });
          }}
        />
      )}
    </div>
  );
};
