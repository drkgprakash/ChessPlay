import React, { useState } from 'react';
import { X, Trophy, Calendar, Clock, Users, Shield, Check, Sparkles } from 'lucide-react';
import { tournamentService } from '../services/tournamentService';

interface CreateTournamentModalProps {
  token: string;
  onClose: () => void;
  onCreated: (newTournamentId: string) => void;
}

interface StudentOption {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  fide_id?: string;
  batch: string;
}

const AVAILABLE_STUDENTS: StudentOption[] = [
  { id: 'st-1', name: 'Aarav Sharma', avatar: '👦', rating: 1640, fide_id: 'FIDE-IND-2401', batch: 'Batch Alpha' },
  { id: 'st-2', name: 'Diya Patel', avatar: '👧', rating: 1580, fide_id: 'FIDE-IND-2402', batch: 'Batch Alpha' },
  { id: 'st-3', name: 'Rohan Iyer', avatar: '🧑', rating: 1520, fide_id: 'FIDE-IND-2403', batch: 'Batch Alpha' },
  { id: 'st-4', name: 'Kabir Verma', avatar: '👦', rating: 1490, fide_id: 'FIDE-IND-2404', batch: 'Batch Alpha' },
  { id: 'st-5', name: 'Ananya Gupta', avatar: '👧', rating: 1430, fide_id: 'FIDE-IND-2405', batch: 'Batch Alpha' },
  { id: 'st-6', name: 'Meera Nair', avatar: '👧', rating: 1390, fide_id: 'FIDE-IND-2406', batch: 'Batch Alpha' },
  { id: 'st-7', name: 'Devansh Joshi', avatar: '👦', rating: 1350, fide_id: 'FIDE-IND-2407', batch: 'Batch Alpha' },
  { id: 'st-8', name: 'Ishaan Reddy', avatar: '👦', rating: 1310, fide_id: 'FIDE-IND-2408', batch: 'Batch Alpha' }
];

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  token,
  onClose,
  onCreated
}) => {
  const [title, setTitle] = useState('Autumn Rapid Open — Championship 2026');
  const [format, setFormat] = useState<'swiss' | 'round_robin' | 'arena'>('swiss');
  const [timeControl, setTimeControl] = useState('10m + 5s Rapid');
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    AVAILABLE_STUDENTS.map(s => s.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedStudentIds(AVAILABLE_STUDENTS.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Tournament title is required');
      return;
    }
    if (selectedStudentIds.length < 2) {
      setErrorMsg('Please select at least 2 participants');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await tournamentService.createTournament(token, {
        title: title.trim(),
        format,
        time_control: timeControl,
        total_rounds: Number(totalRounds),
        scheduled_at: scheduledAt.replace('T', ' ') + ':00',
        batch_id: 'batch-01',
        participant_student_ids: selectedStudentIds
      });

      if (res.status === 'success' && res.tournament_id) {
        onCreated(res.tournament_id);
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to create tournament');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xl shadow-inner">
              <Trophy className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Create Academy Tournament
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                  FIDE Swiss Engine
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Configure pairing rules, rounds, and enroll academy participants</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 text-xs">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-orange-400" /> Tournament Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunday Rapid Grand Prix — September Edition"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
              required
            />
          </div>

          {/* Format & Time Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-400" /> Tournament Format
              </label>
              <select
                value={format}
                onChange={(e: any) => setFormat(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="swiss">FIDE Swiss System (Auto Pairings)</option>
                <option value="round_robin">Round Robin (All-play-All)</option>
                <option value="arena">Arena Speed Run (Continuous)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-400" /> Time Control
              </label>
              <select
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="10m + 5s Rapid">10m + 5s Rapid (FIDE Official)</option>
                <option value="15m + 10s Rapid">15m + 10s Classical Rapid</option>
                <option value="5m + 3s Blitz">5m + 3s Blitz</option>
                <option value="3m + 2s Blitz">3m + 2s Bullet/Blitz</option>
                <option value="30m Classical">30m Classical Championship</option>
              </select>
            </div>
          </div>

          {/* Total Rounds & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Total Rounds
              </label>
              <select
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value={3}>3 Rounds (Short Weekend)</option>
                <option value={5}>5 Rounds (Standard Grand Prix)</option>
                <option value={7}>7 Rounds (Championship Open)</option>
                <option value={9}>9 Rounds (Full Master Tournament)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" /> Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>
          </div>

          {/* Student Enrollment Roster */}
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                Enroll Participants ({selectedStudentIds.length} Selected)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[11px] text-orange-400 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[11px] text-zinc-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {AVAILABLE_STUDENTS.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-orange-950/20 border-orange-500/40 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{student.avatar}</span>
                      <div>
                        <div className="font-bold text-xs text-white">{student.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {student.rating} ELO • {student.fide_id}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-zinc-700 bg-zinc-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Pairings...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Create & Seed Round 1
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
