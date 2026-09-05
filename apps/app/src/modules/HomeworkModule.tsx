import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Layers, 
  UserCheck, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Clock, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RotateCcw, 
  Lightbulb, 
  ArrowRight, 
  Filter, 
  Search, 
  ChevronRight, 
  BookOpen, 
  MessageSquare, 
  Trash2, 
  Eye, 
  Send, 
  Flame, 
  GraduationCap, 
  Loader2 
} from 'lucide-react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import confetti from 'canvas-confetti';
import { useAuth } from '../services/authContext';
import { 
  homeworkService, 
  HomeworkAssignment, 
  HomeworkDrill, 
  HomeworkSubmission, 
  HomeworkSummaryStats, 
  BatchOption 
} from '../services/homeworkService';
import { ChessBoard } from '../components/ChessBoard';
import { sounds } from '../utils/soundEffects';

export const HomeworkModule: React.FC = () => {
  const { user, token } = useAuth();
  const isStudent = user?.role === 'student';
  const canManage = user?.role === 'saas_owner' || user?.role === 'academy_admin' || user?.role === 'head_coach' || user?.role === 'assistant_coach';

  // State
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [stats, setStats] = useState<HomeworkSummaryStats>({
    total_assignments: 0,
    total_drills: 0,
    total_completed_submissions: 0,
    global_avg_accuracy: 0
  });
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Student Drill Player State
  const [activeSolvingAssignment, setActiveSolvingAssignment] = useState<HomeworkAssignment | null>(null);
  const [activeDrillIndex, setActiveDrillIndex] = useState<number>(0);
  const [drillChess, setDrillChess] = useState<Chess | null>(null);
  const [isDrillSolved, setIsDrillSolved] = useState<boolean>(false);
  const [drillErrorMsg, setDrillErrorMsg] = useState<string | null>(null);
  const [hintStage, setHintStage] = useState<number>(0);
  const [drillsCompletedCount, setDrillsCompletedCount] = useState<number>(0);
  const [isAssignmentCompleted, setIsAssignmentCompleted] = useState<boolean>(false);

  // Coach Modal States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedGradebookAssignment, setSelectedGradebookAssignment] = useState<HomeworkAssignment | null>(null);
  const [gradebookSubmissions, setGradebookSubmissions] = useState<HomeworkSubmission[]>([]);
  const [gradebookDrills, setGradebookDrills] = useState<HomeworkDrill[]>([]);
  const [isGradebookLoading, setIsGradebookLoading] = useState<boolean>(false);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [savingFeedbackId, setSavingFeedbackId] = useState<string | null>(null);

  // Create Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBatchId, setNewBatchId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Master'>('Intermediate');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Initial drills for new assignment builder
  const [builderDrills, setBuilderDrills] = useState<Array<{
    title: string;
    theme: string;
    fen: string;
    initial_turn: 'w' | 'b';
    solution_moves: string[];
    hint_piece: string;
    hint_square: string;
    hint_solution: string;
    explanation: string;
  }>>([
    {
      title: 'Tactical Pin Resolution',
      theme: 'Pin & King Safety',
      fen: 'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8',
      initial_turn: 'w',
      solution_moves: ['O-O'],
      hint_piece: 'Prioritize king safety.',
      hint_square: 'Castle kingside.',
      hint_solution: 'O-O breaks the pin.',
      explanation: 'Castling neutralizes pin tactics safely.'
    }
  ]);

  // Load Data
  const loadHomework = async () => {
    if (!token) return;
    setIsLoading(true);
    const data = await homeworkService.getHomeworkList(token, selectedBatchId);
    if (data.status === 'success') {
      setAssignments(data.assignments);
      if (data.batches) setBatches(data.batches);
      if (data.stats) setStats(data.stats);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadHomework();
  }, [token, selectedBatchId]);

  // Initialize drill in chess engine
  useEffect(() => {
    if (activeSolvingAssignment && activeSolvingAssignment.drills && activeSolvingAssignment.drills.length > 0) {
      const currentDrill = activeSolvingAssignment.drills[activeDrillIndex];
      if (currentDrill) {
        try {
          const c = new Chess(currentDrill.fen);
          setDrillChess(c);
          setIsDrillSolved(false);
          setDrillErrorMsg(null);
          setHintStage(0);
        } catch {
          // Invalid FEN fallback
          setDrillChess(new Chess());
        }
      }
    }
  }, [activeSolvingAssignment, activeDrillIndex]);

  // Handle student move in drill solver
  const handleDrillMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (!drillChess || isDrillSolved || !activeSolvingAssignment) return;

    const currentDrill = activeSolvingAssignment.drills?.[activeDrillIndex];
    if (!currentDrill) return;

    try {
      const move = drillChess.move({ from, to, promotion });
      if (!move) return;

      const expectedMoveSan = currentDrill.solution_moves[0];

      if (move.san === expectedMoveSan) {
        // Correct move!
        if (move.captured) sounds.playCapture();
        else sounds.playMove();

        sounds.playSuccess();
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
        setIsDrillSolved(true);
        setDrillErrorMsg(null);

        const newCount = Math.max(drillsCompletedCount, activeDrillIndex + 1);
        setDrillsCompletedCount(newCount);

        // Submit progress to backend
        const total = activeSolvingAssignment.drills?.length || 1;
        homeworkService.submitDrillProgress(token || '', activeSolvingAssignment.id, newCount, total);

        if (activeDrillIndex + 1 >= total) {
          setIsAssignmentCompleted(true);
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        }
      } else {
        // Incorrect candidate move
        sounds.playError();
        setDrillErrorMsg('Not quite! Re-evaluate piece coordination and try again.');
        setTimeout(() => {
          drillChess.undo();
          setDrillChess(new Chess(drillChess.fen()));
        }, 600);
      }
    } catch {
      // Illegal move
    }
  };

  // Open solving modal for student
  const startSolving = (assign: HomeworkAssignment) => {
    setActiveSolvingAssignment(assign);
    setActiveDrillIndex(0);
    setDrillsCompletedCount(assign.drills_completed || 0);
    setIsAssignmentCompleted(assign.submission_status === 'completed');
  };

  // Open gradebook for coach
  const openGradebook = async (assign: HomeworkAssignment) => {
    setSelectedGradebookAssignment(assign);
    setIsGradebookLoading(true);
    const details = await homeworkService.getAssignmentDetail(token || '', assign.id);
    if (details) {
      setGradebookSubmissions(details.submissions);
      setGradebookDrills(details.drills);
      const inputs: Record<string, string> = {};
      details.submissions.forEach(s => {
        inputs[s.id] = s.coach_feedback || '';
      });
      setFeedbackInputs(inputs);
    }
    setIsGradebookLoading(false);
  };

  // Save coach feedback
  const handleSaveFeedback = async (submissionId: string) => {
    if (!token) return;
    setSavingFeedbackId(submissionId);
    const text = feedbackInputs[submissionId] || '';
    await homeworkService.gradeSubmission(token, submissionId, text);
    setSavingFeedbackId(null);
    // Update local state
    setGradebookSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, coach_feedback: text, status: 'reviewed' } : s)
    );
  };

  // Handle assignment creation
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newTitle.trim()) {
      setCreateError('Please enter an assignment title.');
      return;
    }
    if (!newBatchId) {
      setCreateError('Please select a target batch.');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    const res = await homeworkService.createAssignment(token, {
      title: newTitle,
      batch_id: newBatchId,
      due_date: newDueDate || undefined,
      difficulty: newDifficulty,
      description: newDescription,
      drills: builderDrills
    });

    setIsCreating(false);

    if (res.success) {
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      loadHomework();
    } else {
      setCreateError(res.message);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.batch_name && a.batch_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto pb-16">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wide">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Interactive Academy Curricula</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isStudent ? 'My Tactical Drills & Homework' : 'Batch Homework & Tactical Drills'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            {isStudent
              ? 'Solve tactical chess drills assigned by your coach. Move pieces directly on the board with instant verification.'
              : 'Assign interactive chess puzzles and endgame studies to batches. Track completion rates and accuracy automatically in real time.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setShowCreateModal(true);
              if (batches.length > 0 && !newBatchId) {
                setNewBatchId(batches[0].id);
              }
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Assign New Homework
          </button>
        )}
      </div>

      {/* KPI Stats (For Coaches & Admins) */}
      {!isStudent && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Assignments</div>
              <div className="text-2xl font-black text-white mt-1">{stats.total_assignments}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Active curricula</div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tactical Drills</div>
              <div className="text-2xl font-black text-orange-400 mt-1">{stats.total_drills}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">FEN exercise boards</div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Submissions Solved</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{stats.total_completed_submissions}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Completed by students</div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Batch Accuracy</div>
              <div className="text-2xl font-black text-purple-400 mt-1">{stats.global_avg_accuracy}%</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Average score</div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {!isStudent && batches.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 transition"
            >
              <option value="">All Academy Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.level})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
          <div className="text-xs text-zinc-400 font-mono">Loading homework assignments from database...</div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-zinc-900/40 border border-dashed border-zinc-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto text-2xl">
            ♟️
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Homework Assignments Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {isStudent
                ? 'Great job! You are all caught up with your tactical homework.'
                : 'No homework created yet for this batch. Click "Assign New Homework" to get started.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((a) => {
            const isCompleted = isStudent ? a.submission_status === 'completed' : (a.completed_count || 0) >= (a.total_assigned || 1);
            const isInProgress = isStudent ? a.submission_status === 'in_progress' : false;

            return (
              <div
                key={a.id}
                className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between gap-5 group shadow-lg"
              >
                <div className="space-y-3">
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {a.batch_name || 'Batch Alpha'}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        a.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                        a.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {a.difficulty}
                      </span>
                    </div>

                    {isStudent ? (
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                        {isCompleted ? 'Completed 100%' : isInProgress ? 'In Progress' : 'Assigned'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" /> Due: {a.due_date || '7 days'}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition">
                      {a.title}
                    </h3>
                    {a.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {a.description}
                      </p>
                    )}
                  </div>

                  {/* Student View: Coach Feedback Alert */}
                  {isStudent && a.coach_feedback && (
                    <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-400" />
                      <div>
                        <div className="font-bold text-white text-[11px]">Coach Feedback:</div>
                        <div className="text-zinc-300 mt-0.5 italic">"{a.coach_feedback}"</div>
                      </div>
                    </div>
                  )}

                  {/* Progress Stats */}
                  <div className="pt-2">
                    {isStudent ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Drills Progress</span>
                          <span className="font-mono font-bold text-zinc-200">
                            {a.drills_completed || 0} / {a.total_drills || (a.drills?.length || 3)} Solved
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                            }`}
                            style={{
                              width: `${
                                a.total_drills
                                  ? Math.min(100, Math.round(((a.drills_completed || 0) / a.total_drills) * 100))
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Student Submissions</span>
                          <span className="font-mono font-bold text-zinc-200">
                            {a.completed_count || 0} / {a.total_assigned || 6} Completed ({Math.round(((a.completed_count || 0) / (a.total_assigned || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((a.completed_count || 0) / (a.total_assigned || 1)) * 100)
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  {isStudent ? (
                    <button
                      onClick={() => startSolving(a)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                        isCompleted
                          ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                          : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" /> Practice Drills Again
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Solve Interactive Drills →
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <div className="text-[11px] text-zinc-500">
                        {a.drill_count || 3} Interactive FEN Exercises
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openGradebook(a)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review Gradebook
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete assignment "${a.title}"?`)) {
                              await homeworkService.deleteAssignment(token || '', a.id);
                              loadHomework();
                            }
                          }}
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT INTERACTIVE DRILL SOLVER MODAL                                   */}
      {/* ========================================================================= */}
      {activeSolvingAssignment && activeSolvingAssignment.drills && activeSolvingAssignment.drills.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
                  ♞
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeSolvingAssignment.title}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Drill {activeDrillIndex + 1} of {activeSolvingAssignment.drills.length} • {activeSolvingAssignment.drills[activeDrillIndex]?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSolvingAssignment(null);
                  loadHomework();
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drill Content Body */}
            <div className="p-6 overflow-y-auto flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Interactive Chess Board */}
              <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
                <div className="w-full max-w-[460px] flex items-center justify-between px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    {activeSolvingAssignment.drills[activeDrillIndex]?.initial_turn === 'w' ? 'White to Move' : 'Black to Move'}
                  </span>
                  <span className="text-xs font-bold text-zinc-400">
                    Theme: {activeSolvingAssignment.drills[activeDrillIndex]?.theme}
                  </span>
                </div>

                <div className="w-full max-w-[460px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                  {drillChess && (
                    <ChessBoard
                      chess={drillChess}
                      orientation={activeSolvingAssignment.drills[activeDrillIndex]?.initial_turn || 'w'}
                      onMove={handleDrillMove}
                      interactive={!isDrillSolved}
                    />
                  )}
                </div>
              </div>

              {/* Drill Instructions & Hint Controls */}
              <div className="flex-1 w-full space-y-5">
                {/* Status Banners */}
                {isDrillSolved && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 animate-in zoom-in-95">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Brilliant Move! Drill Solved!</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {activeSolvingAssignment.drills[activeDrillIndex]?.explanation}
                    </p>
                  </div>
                )}

                {drillErrorMsg && !isDrillSolved && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{drillErrorMsg}</span>
                  </div>
                )}

                {/* Exercise Info Card */}
                <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Instructions</div>
                  <h4 className="text-sm font-bold text-white">
                    {activeSolvingAssignment.drills[activeDrillIndex]?.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Examine the board carefully. Calculate your candidate moves and make the winning tactical continuation.
                  </p>
                </div>

                {/* 3-Stage Hint System */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Coaching Hints
                    </span>
                    <button
                      type="button"
                      disabled={hintStage >= 3 || isDrillSolved}
                      onClick={() => setHintStage(prev => Math.min(3, prev + 1))}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 disabled:opacity-40"
                    >
                      {hintStage === 0 ? 'Request Hint →' : hintStage < 3 ? 'Reveal Next Clue →' : 'Solution Revealed'}
                    </button>
                  </div>

                  {hintStage >= 1 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      <strong>Hint 1:</strong> {activeSolvingAssignment.drills[activeDrillIndex]?.hint_piece}
                    </div>
                  )}

                  {hintStage >= 2 && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                      <strong>Hint 2:</strong> {activeSolvingAssignment.drills[activeDrillIndex]?.hint_square}
                    </div>
                  )}

                  {hintStage >= 3 && (
                    <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-200 text-xs font-mono">
                      <strong>Solution:</strong> {activeSolvingAssignment.drills[activeDrillIndex]?.hint_solution}
                    </div>
                  )}
                </div>

                {/* Next / Reset Controls */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const cur = activeSolvingAssignment.drills?.[activeDrillIndex];
                      if (cur) {
                        setDrillChess(new Chess(cur.fen));
                        setIsDrillSolved(false);
                        setDrillErrorMsg(null);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Board
                  </button>

                  {activeDrillIndex + 1 < activeSolvingAssignment.drills.length ? (
                    <button
                      disabled={!isDrillSolved}
                      onClick={() => setActiveDrillIndex(prev => prev + 1)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition"
                    >
                      <span>Next Drill</span> <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSolvingAssignment(null);
                        loadHomework();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete & Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COACH GRADEBOOK & SUBMISSIONS MODAL                                      */}
      {/* ========================================================================= */}
      {selectedGradebookAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
                  📋
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Gradebook: {selectedGradebookAssignment.title}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {selectedGradebookAssignment.batch_name} • Student Submissions & Coach Review
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGradebookAssignment(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {isGradebookLoading ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-400 mb-2" />
                  Loading submissions roster...
                </div>
              ) : gradebookSubmissions.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No submissions recorded yet for this batch assignment.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Enrolled Batch Students ({gradebookSubmissions.length})
                  </div>

                  <div className="space-y-3">
                    {gradebookSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{sub.avatar_emoji || '👦'}</span>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <span>{sub.student_name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                {sub.rating} ELO
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono">
                              {sub.student_email}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                          {/* Progress Badges */}
                          <div className="text-left md:text-right">
                            <div className="text-xs font-bold text-white">
                              {sub.drills_completed} / {sub.total_drills} Drills ({sub.score_pct}%)
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === 'completed' || sub.status === 'reviewed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : sub.status === 'in_progress'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {sub.status.toUpperCase()}
                            </span>
                          </div>

                          {/* Coach Feedback Input */}
                          <div className="flex items-center gap-2 flex-1 md:flex-initial">
                            <input
                              type="text"
                              value={feedbackInputs[sub.id] || ''}
                              onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [sub.id]: e.target.value })}
                              placeholder="Write coach feedback..."
                              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 w-48"
                            />
                            <button
                              onClick={() => handleSaveFeedback(sub.id)}
                              disabled={savingFeedbackId === sub.id}
                              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition"
                            >
                              {savingFeedbackId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE ASSIGNMENT MODAL (COACH / ADMIN)                                   */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
                  ➕
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Create Batch Homework & Drills</h2>
                  <p className="text-xs text-zinc-400">Assign tactical FEN puzzles to batch students</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 overflow-y-auto space-y-5">
              {createError && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Assignment Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Week 5: Pawn Endgame Breakthroughs & Deflections"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Target Batch</label>
                  <select
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-orange-500"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-orange-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Master">Master</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Coaching Instructions</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Explain candidate move rules, time limits, or target ideas for students..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Tactical Drill Included Summary */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-400" />
                    Tactical Exercise Drills ({builderDrills.length})
                  </span>
                  <span className="text-[10px] text-zinc-500">Auto-validated board moves</span>
                </div>
                {builderDrills.map((d, i) => (
                  <div key={i} className="text-xs text-zinc-400 flex items-center justify-between p-2 rounded-lg bg-zinc-900">
                    <span>{d.title} ({d.theme})</span>
                    <span className="font-mono text-orange-400 font-bold">{d.solution_moves.join(', ')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                  Assign Homework to Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
