// =========================================================
// Chess Play Tournament Organizer & Swiss Pairings Service
// =========================================================

export interface Tournament {
  id: string;
  academy_id: string;
  academy_name?: string;
  batch_id?: string | null;
  batch_name?: string | null;
  title: string;
  format: 'swiss' | 'round_robin' | 'arena';
  time_control: string;
  total_rounds: number;
  current_round: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  scheduled_at: string;
  participant_count?: number;
  created_at?: string;
}

export interface TournamentPlayer {
  id: string;
  tournament_id: string;
  student_id: string;
  name: string;
  avatar_emoji?: string;
  fide_id?: string;
  rating: number;
  score: number;
  buchholz: number;
  sonneborn_berger: number;
  rank: number;
  streak: number;
  performance_rating: number;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  table_number: number;
  white_student_id: string;
  black_student_id: string | null;
  white_name: string;
  white_avatar?: string;
  white_rating: number;
  black_name?: string | null;
  black_avatar?: string | null;
  black_rating?: number | null;
  result?: '1-0' | '0-1' | '1/2-1/2' | '*' | null;
  is_bye?: boolean | number;
}

export interface TournamentDetailData {
  status: string;
  tournament: Tournament;
  standings: TournamentPlayer[];
  matches: TournamentMatch[];
  selected_round: number;
  available_rounds: number[];
}

// Fallback seed tournament for resilient offline / demo usage
const FALLBACK_TOURNAMENT: Tournament = {
  id: 'tourn-01',
  academy_id: 'acad-001',
  academy_name: 'Grandmaster Chess Academy',
  batch_id: 'batch-01',
  batch_name: 'Batch Alpha (1400-1800)',
  title: 'Sunday Rapid Grand Prix — September Edition',
  format: 'swiss',
  time_control: '10m + 5s Rapid',
  total_rounds: 5,
  current_round: 3,
  status: 'in_progress',
  scheduled_at: '2026-09-06 10:00:00',
  participant_count: 8
};

const FALLBACK_STANDINGS: TournamentPlayer[] = [
  { id: 'tp-1', tournament_id: 'tourn-01', student_id: 'st-1', name: 'Aarav Sharma', avatar_emoji: '👦', fide_id: 'FIDE-IND-2401', rating: 1640, score: 2.5, buchholz: 4.5, sonneborn_berger: 3.75, rank: 1, streak: 3, performance_rating: 1720 },
  { id: 'tp-2', tournament_id: 'tourn-01', student_id: 'st-2', name: 'Diya Patel', avatar_emoji: '👧', fide_id: 'FIDE-IND-2402', rating: 1580, score: 2.0, buchholz: 4.5, sonneborn_berger: 2.5, rank: 2, streak: 2, performance_rating: 1650 },
  { id: 'tp-3', tournament_id: 'tourn-01', student_id: 'st-3', name: 'Rohan Iyer', avatar_emoji: '🧑', fide_id: 'FIDE-IND-2403', rating: 1520, score: 2.0, buchholz: 3.5, sonneborn_berger: 2.0, rank: 3, streak: 1, performance_rating: 1580 },
  { id: 'tp-4', tournament_id: 'tourn-01', student_id: 'st-4', name: 'Kabir Verma', avatar_emoji: '👦', fide_id: 'FIDE-IND-2404', rating: 1490, score: 1.5, buchholz: 4.0, sonneborn_berger: 1.5, rank: 4, streak: 0, performance_rating: 1490 },
  { id: 'tp-5', tournament_id: 'tourn-01', student_id: 'st-5', name: 'Ananya Gupta', avatar_emoji: '👧', fide_id: 'FIDE-IND-2405', rating: 1430, score: 1.5, buchholz: 3.5, sonneborn_berger: 1.25, rank: 5, streak: 1, performance_rating: 1440 },
  { id: 'tp-6', tournament_id: 'tourn-01', student_id: 'st-6', name: 'Meera Nair', avatar_emoji: '👧', fide_id: 'FIDE-IND-2406', rating: 1390, score: 1.0, buchholz: 4.0, sonneborn_berger: 0.5, rank: 6, streak: 0, performance_rating: 1360 },
  { id: 'tp-7', tournament_id: 'tourn-01', student_id: 'st-7', name: 'Devansh Joshi', avatar_emoji: '👦', fide_id: 'FIDE-IND-2407', rating: 1350, score: 1.0, buchholz: 3.5, sonneborn_berger: 0.5, rank: 7, streak: 0, performance_rating: 1320 },
  { id: 'tp-8', tournament_id: 'tourn-01', student_id: 'st-8', name: 'Ishaan Reddy', avatar_emoji: '👦', fide_id: 'FIDE-IND-2408', rating: 1310, score: 0.5, buchholz: 4.5, sonneborn_berger: 0.25, rank: 8, streak: 0, performance_rating: 1220 }
];

const FALLBACK_MATCHES_R3: TournamentMatch[] = [
  { id: 'tm-r3-1', tournament_id: 'tourn-01', round_number: 3, table_number: 1, white_student_id: 'st-1', black_student_id: 'st-2', white_name: 'Aarav Sharma', white_avatar: '👦', white_rating: 1640, black_name: 'Diya Patel', black_avatar: '👧', black_rating: 1580, result: '*' },
  { id: 'tm-r3-2', tournament_id: 'tourn-01', round_number: 3, table_number: 2, white_student_id: 'st-3', black_student_id: 'st-4', white_name: 'Rohan Iyer', white_avatar: '🧑', white_rating: 1520, black_name: 'Kabir Verma', black_avatar: '👦', black_rating: 1490, result: '*' },
  { id: 'tm-r3-3', tournament_id: 'tourn-01', round_number: 3, table_number: 3, white_student_id: 'st-5', black_student_id: 'st-6', white_name: 'Ananya Gupta', white_avatar: '👧', white_rating: 1430, black_name: 'Meera Nair', black_avatar: '👧', black_rating: 1390, result: '*' },
  { id: 'tm-r3-4', tournament_id: 'tourn-01', round_number: 3, table_number: 4, white_student_id: 'st-7', black_student_id: 'st-8', white_name: 'Devansh Joshi', white_avatar: '👦', white_rating: 1350, black_name: 'Ishaan Reddy', black_avatar: '👦', black_rating: 1310, result: '*' }
];

export const tournamentService = {
  // Fetch tournament list
  async getTournaments(token: string): Promise<Tournament[]> {
    try {
      const res = await fetch('/api/tournaments.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch tournaments');
      const data = await res.json();
      return data.tournaments || [FALLBACK_TOURNAMENT];
    } catch {
      return [FALLBACK_TOURNAMENT];
    }
  },

  // Fetch full tournament details with standings and matches for round
  async getTournamentDetail(
    token: string,
    tournamentId: string = 'tourn-01',
    round?: number
  ): Promise<TournamentDetailData> {
    try {
      const params = new URLSearchParams({
        action: 'tournament_detail',
        id: tournamentId
      });
      if (round) params.append('round', round.toString());

      const res = await fetch(`/api/tournaments.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch tournament detail');
      const data = await res.json();
      if (data.status === 'success') {
        return {
          status: 'success',
          tournament: data.tournament,
          standings: data.standings || [],
          matches: data.matches || [],
          selected_round: data.selected_round || 3,
          available_rounds: data.available_rounds || [1, 2, 3]
        };
      }
      throw new Error(data.message || 'Error fetching tournament');
    } catch {
      return {
        status: 'success',
        tournament: FALLBACK_TOURNAMENT,
        standings: FALLBACK_STANDINGS,
        matches: FALLBACK_MATCHES_R3,
        selected_round: round || 3,
        available_rounds: [1, 2, 3]
      };
    }
  },

  // Record match result (1-0, 0-1, 1/2-1/2)
  async recordMatchResult(
    token: string,
    matchId: string,
    result: '1-0' | '0-1' | '1/2-1/2'
  ): Promise<{ status: string; message: string }> {
    try {
      const res = await fetch('/api/tournaments.php?action=record_result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          match_id: matchId,
          result: result
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to record match result');
      }

      return await res.json();
    } catch (err: any) {
      return { status: 'error', message: err.message || 'Network error' };
    }
  },

  // Generate next round pairings with Swiss engine
  async advanceNextRound(
    token: string,
    tournamentId: string
  ): Promise<{ status: string; message: string; round_number?: number; pairs_count?: number }> {
    try {
      const res = await fetch('/api/tournaments.php?action=next_round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tournament_id: tournamentId
        })
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to advance round');
      }
      return data;
    } catch (err: any) {
      return { status: 'error', message: err.message || 'Network error' };
    }
  },

  // Create new tournament
  async createTournament(
    token: string,
    payload: {
      title: string;
      format?: string;
      time_control?: string;
      total_rounds?: number;
      scheduled_at?: string;
      batch_id?: string;
      participant_student_ids?: string[];
    }
  ): Promise<{ status: string; message: string; tournament_id?: string }> {
    try {
      const res = await fetch('/api/tournaments.php?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to create tournament');
      }
      return data;
    } catch (err: any) {
      return { status: 'error', message: err.message || 'Network error' };
    }
  }
};
