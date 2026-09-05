import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { 
  Video, VideoOff, Mic, MicOff, Lock, Unlock, Users, MessageSquare, 
  Sparkles, Eye, ShieldCheck, Hand, AlertTriangle, CheckCircle2, 
  RotateCcw, Send, Zap, X, ArrowRight, HelpCircle
} from 'lucide-react';
import { ArrowAnnotation } from '../types/chess';
import { sounds } from '../utils/soundEffects';
import { useAuth } from '../services/authContext';
import { 
  classroomService, 
  ClassroomSession, 
  StudentBoardState, 
  ClassroomChatMessage 
} from '../services/classroomService';

const DEFAULT_STUDENT_BOARDS: StudentBoardState[] = [
  {
    id: 'sb-01',
    student_id: 'usr-st-01',
    student_name: 'Aarav Sharma',
    avatar: '👦',
    current_fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
    last_move: 'Nf6',
    eval_score: '+3.2',
    status: 'active',
    hand_raised: 1
  },
  {
    id: 'sb-02',
    student_id: 'usr-st-02',
    student_name: 'Diya Patel',
    avatar: '👧',
    current_fen: '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1',
    last_move: 'Rc1#',
    eval_score: '-M1',
    status: 'blunder',
    hand_raised: 0
  },
  {
    id: 'sb-03',
    student_id: 'usr-st-03',
    student_name: 'Rohan Iyer',
    avatar: '🧑',
    current_fen: 'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8',
    last_move: 'd6',
    eval_score: '+0.4',
    status: 'active',
    hand_raised: 0
  },
  {
    id: 'sb-04',
    student_id: 'usr-st-04',
    student_name: 'Ananya Gupta',
    avatar: '👧',
    current_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    last_move: 'e4',
    eval_score: '0.0',
    status: 'waiting',
    hand_raised: 1
  },
  {
    id: 'sb-05',
    student_id: 'usr-st-05',
    student_name: 'Kabir Verma',
    avatar: '👦',
    current_fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    last_move: 'Nf3',
    eval_score: '+0.2',
    status: 'active',
    hand_raised: 0
  },
  {
    id: 'sb-06',
    student_id: 'usr-st-06',
    student_name: 'Meera Nair',
    avatar: '👧',
    current_fen: '5rk1/1p3ppp/pq2p3/3p4/8/1P3Q2/P1r2PPP/R4RK1 w - - 0 20',
    last_move: 'd5',
    eval_score: '+4.8',
    status: 'solved',
    hand_raised: 0
  }
];

const PRESET_POSITIONS = [
  { label: 'Starting Position', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
  { label: 'Italian Game Tactics', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5' },
  { label: 'Lucena Rook Endgame', fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1' },
  { label: 'Queen Sacrifice Mate', fen: 'r1b2rk1/2p2ppp/p7/1p6/3P3q/1BP2QP1/PP3P1b/RNB1R2K b - - 0 16' },
];

export const ClassroomModule: React.FC = () => {
  const { user, token, hasPermission } = useAuth();
  const isCoach = hasPermission('classroom:master') || user?.role === 'saas_owner' || user?.role === 'academy_admin' || user?.role === 'head_coach';

  const [batchId] = useState<string>('batch-01');
  const [activeTab, setActiveTab] = useState<'master' | 'simul'>('master');
  
  // Master Chess State
  const [chess] = useState<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [boardLocked, setBoardLocked] = useState<boolean>(false);
  const [arrows, setArrows] = useState<ArrowAnnotation[]>([]);
  
  // Real-Time Polling & Sync State
  const [lastEventId, setLastEventId] = useState<number>(0);
  const lastEventIdRef = useRef<number>(0);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [studentBoards, setStudentBoards] = useState<StudentBoardState[]>(DEFAULT_STUDENT_BOARDS);
  const [simulFilter, setSimulFilter] = useState<'all' | 'blunders' | 'hands'>('all');
  
  // Co-Pilot Modal State
  const [coPilotStudent, setCoPilotStudent] = useState<StudentBoardState | null>(null);
  const [coPilotChess, setCoPilotChess] = useState<Chess>(new Chess());
  const [coPilotFen, setCoPilotFen] = useState<string>('');

  // AV & Interaction State
  const [micOn, setMicOn] = useState<boolean>(true);
  const [camOn, setCamOn] = useState<boolean>(true);
  const [isMyHandRaised, setIsMyHandRaised] = useState<boolean>(false);

  // Classroom Discussion Chat
  const [chatMessages, setChatMessages] = useState<ClassroomChatMessage[]>([
    { id: 1, sender: 'GM Vikram Sen (Coach)', text: 'Welcome team! Today we are mastering king and rook tactical coordination.', time: '10:01 AM' },
    { id: 2, sender: 'Aarav Sharma', text: 'Ready coach! Looking closely at the weak f7 square.', time: '10:02 AM' },
    { id: 3, sender: 'Diya Patel', text: 'Board 2 reached critical endgame position!', time: '10:03 AM' },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Keep lastEventIdRef synced
  useEffect(() => {
    lastEventIdRef.current = lastEventId;
  }, [lastEventId]);

  // Initial Snapshot Fetch
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const loadSnapshot = async () => {
      try {
        setSyncStatus('syncing');
        const snapshot = await classroomService.getSnapshot(batchId, token);
        if (snapshot && isMounted) {
          if (snapshot.session) {
            setBoardLocked(!!snapshot.session.is_locked);
            if (snapshot.session.master_fen && snapshot.session.master_fen !== chess.fen()) {
              chess.load(snapshot.session.master_fen);
              setFen(snapshot.session.master_fen);
            }
            if (Array.isArray(snapshot.session.active_arrows)) {
              setArrows(snapshot.session.active_arrows);
            }
          }

          if (snapshot.student_boards && snapshot.student_boards.length > 0) {
            setStudentBoards(snapshot.student_boards);
          }

          if (snapshot.chat_messages && snapshot.chat_messages.length > 0) {
            setChatMessages(snapshot.chat_messages);
          }

          if (typeof snapshot.last_event_id === 'number') {
            setLastEventId(snapshot.last_event_id);
            lastEventIdRef.current = snapshot.last_event_id;
          }
          setSyncStatus('connected');
        }
      } catch (err) {
        console.warn('Initial classroom snapshot error:', err);
        if (isMounted) setSyncStatus('offline');
      }
    };

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [batchId, token]);

  // Delta Polling Loop (sub-second sync)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const delta = await classroomService.pollSync(batchId, lastEventIdRef.current, token);
        if (!delta || delta.status !== 'success') return;

        setSyncStatus('connected');

        // Process session updates (lock state, master FEN)
        if (delta.session) {
          setBoardLocked(!!delta.session.is_locked);
          if (delta.session.master_fen && delta.session.master_fen !== chess.fen()) {
            try {
              chess.load(delta.session.master_fen);
              setFen(delta.session.master_fen);
              sounds.playMove();
            } catch {
              // Invalid FEN ignored
            }
          }
          if (Array.isArray(delta.session.active_arrows)) {
            setArrows(delta.session.active_arrows);
          }
        }

        // Process incoming delta events
        if (delta.events && delta.events.length > 0) {
          for (const ev of delta.events) {
            if (ev.event_type === 'move' && ev.payload?.fen) {
              if (ev.payload.fen !== chess.fen()) {
                try {
                  chess.load(ev.payload.fen);
                  setFen(ev.payload.fen);
                  if (chess.isCheck()) sounds.playCheck();
                  else sounds.playMove();
                } catch {
                  // Ignore
                }
              }
            } else if (ev.event_type === 'board_lock') {
              setBoardLocked(!!ev.payload?.is_locked);
            } else if (ev.event_type === 'arrow_draw') {
              setArrows(ev.payload?.arrows || []);
            } else if (ev.event_type === 'chat_message' && ev.payload?.text) {
              const newMsg: ClassroomChatMessage = {
                id: ev.id,
                sender: ev.user_name || 'Participant',
                text: ev.payload.text,
                time: new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setChatMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          }
        }

        // Update student boards
        if (delta.student_boards && delta.student_boards.length > 0) {
          setStudentBoards(delta.student_boards);
        }

        if (typeof delta.last_event_id === 'number' && delta.last_event_id > lastEventIdRef.current) {
          setLastEventId(delta.last_event_id);
          lastEventIdRef.current = delta.last_event_id;
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 750);

    return () => clearInterval(interval);
  }, [batchId, token]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Master Board Move Handler
  const handleMasterMove = async (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (!isCoach && boardLocked) return;

    try {
      const move = chess.move({ from, to, promotion });
      if (move) {
        if (move.captured) sounds.playCapture();
        else sounds.playMove();
        if (chess.isCheck()) sounds.playCheck();

        const newFen = chess.fen();
        setFen(newFen);

        // Broadcast to all connected students
        if (isCoach && token) {
          await classroomService.broadcastMove(batchId, newFen, move.san, token);
        }
      }
    } catch {
      // Invalid move
    }
  };

  // Coach toggles Board Lock
  const handleToggleBoardLock = async () => {
    if (!isCoach || !token) return;
    const nextState = !boardLocked;
    setBoardLocked(nextState);
    await classroomService.broadcastBoardLock(batchId, nextState, token);
  };

  // Coach loads preset position
  const handleLoadPreset = async (targetFen: string) => {
    if (!isCoach) return;
    try {
      chess.load(targetFen);
      setFen(targetFen);
      setArrows([]);
      sounds.playMove();
      if (token) {
        await classroomService.broadcastMove(batchId, targetFen, 'Position Reset', token);
        await classroomService.broadcastArrows(batchId, [], token);
      }
    } catch {
      // Invalid
    }
  };

  // Clear Arrows
  const handleClearArrows = async () => {
    setArrows([]);
    if (isCoach && token) {
      await classroomService.broadcastArrows(batchId, [], token);
    }
  };

  // Add Arrow
  const handleAddArrow = async (arrow: ArrowAnnotation) => {
    const updated = [...arrows, arrow];
    setArrows(updated);
    if (isCoach && token) {
      await classroomService.broadcastArrows(batchId, updated, token);
    }
  };

  // Toggle Hand Raise (Student)
  const handleToggleHandRaise = async () => {
    const nextState = !isMyHandRaised;
    setIsMyHandRaised(nextState);
    if (token) {
      const studentId = user?.id || 'usr-st-01';
      await classroomService.setHandRaised(batchId, studentId, nextState, token);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput.trim();
    setChatInput('');

    if (token) {
      const created = await classroomService.sendChatMessage(batchId, textToSend, token);
      if (created) {
        setChatMessages(prev => [...prev, created]);
      } else {
        // Optimistic append
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: user?.name ? `${user.name} (${user.role === 'head_coach' ? 'Coach' : user.role})` : 'You',
            text: textToSend,
            time: 'Just now'
          }
        ]);
      }
    }
  };

  // Open Co-Pilot Modal for a student
  const handleOpenCoPilot = (student: StudentBoardState) => {
    setCoPilotStudent(student);
    const c = new Chess();
    try {
      c.load(student.current_fen);
    } catch {
      // default
    }
    setCoPilotChess(c);
    setCoPilotFen(c.fen());
  };

  // Make move in Co-Pilot
  const handleCoPilotMove = async (from: Square, to: Square, promotion?: PieceSymbol) => {
    try {
      const move = coPilotChess.move({ from, to, promotion });
      if (move && coPilotStudent) {
        if (move.captured) sounds.playCapture();
        else sounds.playMove();

        const updatedFen = coPilotChess.fen();
        setCoPilotFen(updatedFen);

        // Update student board on backend
        if (token) {
          await classroomService.submitStudentMove(
            batchId,
            coPilotStudent.student_id,
            updatedFen,
            move.san,
            '+1.0',
            'active',
            token
          );
        }

        // Update local state
        setStudentBoards(prev => prev.map(s => 
          s.student_id === coPilotStudent.student_id 
            ? { ...s, current_fen: updatedFen, last_move: move.san, status: 'active' }
            : s
        ));
      }
    } catch {
      // Invalid
    }
  };

  // Calculate raised hands & blunders count
  const raisedHandsCount = studentBoards.filter(s => Boolean(s.hand_raised && s.hand_raised !== 0)).length;
  const blundersCount = studentBoards.filter(s => s.status === 'blunder').length;

  // Filtered student boards
  const filteredBoards = studentBoards.filter(st => {
    if (simulFilter === 'blunders') return st.status === 'blunder';
    if (simulFilter === 'hands') return Boolean(st.hand_raised && st.hand_raised !== 0);
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ========================================================= */}
      {/* 1. Classroom Header & Global Control Bar                  */}
      {/* ========================================================= */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-amber-500/10 border border-orange-500/40 text-orange-400 flex items-center justify-center font-black text-2xl shadow-inner">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-white tracking-tight">
                Live Masterclass — Batch Alpha (Advanced)
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SIGNALING
              </span>
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-3 mt-1 font-medium">
              <span>Head Coach: <strong className="text-zinc-200">GM Vikram Sen</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <Users className="w-3.5 h-3.5 text-orange-400" /> {studentBoards.length} Students Connected
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400/90">
                <Zap className="w-3 h-3 text-emerald-400" /> Sub-Second Sync Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Hand Raise Counter Pill (Coach Alert) */}
          {raisedHandsCount > 0 && (
            <button
              onClick={() => {
                setActiveTab('simul');
                setSimulFilter('hands');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 animate-pulse shadow-sm hover:bg-amber-500/30 transition"
              title="Students have raised their hands for assistance"
            >
              <Hand className="w-4 h-4 text-amber-400" />
              <span>{raisedHandsCount} Hand{raisedHandsCount > 1 ? 's' : ''} Raised</span>
            </button>
          )}

          {/* Student Raise Hand Button (Visible for all, active for non-coach) */}
          <button
            onClick={handleToggleHandRaise}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isMyHandRaised
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
            title="Ask coach a question"
          >
            <Hand className="w-4 h-4" />
            {isMyHandRaised ? 'Hand Raised ✋' : 'Raise Hand'}
          </button>

          {/* Master vs Simul View Switcher */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'master' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Master Board
            </button>
            <button
              onClick={() => setActiveTab('simul')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'simul' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Simul Grid (6 Boards)
              {blundersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          </div>

          {/* Coach Remote Board Lock */}
          {isCoach && (
            <button
              onClick={handleToggleBoardLock}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                boardLocked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title={boardLocked ? 'Unlock student move interaction' : 'Lock student moves during lecture'}
            >
              {boardLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {boardLocked ? 'Board Locked' : 'Unlocked'}
            </button>
          )}

          {/* AV Controls */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setMicOn(prev => !prev)}
              className={`p-2 rounded-lg text-xs transition ${
                micOn ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-rose-500/20 text-rose-300'
              }`}
              title={micOn ? 'Mute Audio' : 'Unmute Audio'}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCamOn(prev => !prev)}
              className={`p-2 rounded-lg text-xs transition ${
                camOn ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-rose-500/20 text-rose-300'
              }`}
              title={camOn ? 'Stop Camera' : 'Start Camera'}
            >
              {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Main Master Board View                                */}
      {/* ========================================================= */}
      {activeTab === 'master' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Board Column (Col 8) */}
          <div className="lg:col-span-8 flex flex-col items-center gap-4">
            {/* Lock Notice Banner */}
            {boardLocked && (
              <div className="w-full max-w-[600px] bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
                <div className="flex items-center gap-2 font-medium">
                  <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>Master Board Locked:</strong> Coach Vikram has locked move inputs. Please follow along on screen.
                  </span>
                </div>
                {isCoach && (
                  <button
                    onClick={handleToggleBoardLock}
                    className="text-xs font-bold text-rose-300 underline hover:text-white"
                  >
                    Unlock
                  </button>
                )}
              </div>
            )}

            {/* The Master Board */}
            <div className="w-full max-w-[600px] bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-2xl">
              <ChessBoard
                chess={chess}
                onMove={handleMasterMove}
                orientation="w"
                interactive={isCoach || !boardLocked}
                arrows={arrows}
                onAddArrow={handleAddArrow}
                onClearAnnotations={handleClearArrows}
              />
            </div>

            {/* Coach Quick Tactics & Presets Bar */}
            {isCoach && (
              <div className="w-full max-w-[600px] bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-md">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Quick Setups:
                </span>
                <div className="flex items-center flex-wrap gap-1.5">
                  {PRESET_POSITIONS.map((pos, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadPreset(pos.fen)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 text-[11px] font-semibold text-zinc-300 hover:text-white transition"
                    >
                      {pos.label}
                    </button>
                  ))}
                  <button
                    onClick={handleClearArrows}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-orange-400 hover:text-orange-300 transition"
                  >
                    Clear Arrows
                  </button>
                </div>
              </div>
            )}

            <div className="text-[11px] text-zinc-500 flex items-center justify-between w-full max-w-[600px] px-1">
              <span>💡 Right-click & drag on board to draw live synchronized tactical arrows.</span>
              <span className="font-mono text-zinc-400">FEN: {fen.split(' ')[0].substring(0, 24)}...</span>
            </div>
          </div>

          {/* Classroom Side Panel: Video Stream & Chat (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Coach Video Stream Tile */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 relative flex items-center justify-center">
                {camOn ? (
                  <div className="text-center p-4">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 text-3xl flex items-center justify-center mx-auto border border-orange-500/40 shadow-inner">
                      👨‍🏫
                    </div>
                    <span className="text-xs font-black text-white mt-2 block">GM Vikram Sen</span>
                    <span className="text-[10px] text-zinc-400 font-medium">Head Coach & FIDE Master</span>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <VideoOff className="w-4 h-4" /> Camera Stream Paused
                  </div>
                )}
                
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  1080p 60FPS
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-zinc-300">
                  Latency: 38ms
                </div>
              </div>
            </div>

            {/* Real-Time Live Chat */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col h-[340px]">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <MessageSquare className="w-4 h-4 text-orange-400" /> Classroom Discussion
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Live Sync</span>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 text-xs pr-1">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className="flex flex-col gap-1 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-400 text-[11px]">{msg.sender}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{msg.time}</span>
                    </div>
                    <p className="text-zinc-200 leading-snug">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask GM Vikram or share idea..."
                  className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500 transition placeholder:text-zinc-600"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 font-bold text-white transition shadow-md shadow-orange-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 3. Simul Multi-Board Grid (Coach Monitoring 6 Boards)     */
        /* ========================================================= */
        <div className="flex flex-col gap-5 animate-in fade-in">
          {/* Simul Control Banner & Blunder Radar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  Simultaneous Multi-Board Radar
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                    6 Active Boards
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Coach GM Vikram Sen can inspect any student board in real-time, test alternative lines, or co-pilot critical endgame moves.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
              <button
                onClick={() => setSimulFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  simulFilter === 'all' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All (6)
              </button>
              <button
                onClick={() => setSimulFilter('blunders')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  simulFilter === 'blunders' ? 'bg-rose-500/30 text-rose-300 shadow border border-rose-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Blunders ({blundersCount})
              </button>
              <button
                onClick={() => setSimulFilter('hands')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  simulFilter === 'hands' ? 'bg-amber-500/30 text-amber-300 shadow border border-amber-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Hand className="w-3.5 h-3.5 text-amber-400" />
                Raised Hands ({raisedHandsCount})
              </button>
            </div>
          </div>

          {/* 6-Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBoards.map((st) => {
              const studentChess = new Chess();
              try {
                studentChess.load(st.current_fen);
              } catch {
                // Ignore fallback
              }

              const isHandUp = Boolean(st.hand_raised && st.hand_raised !== 0);

              return (
                <div
                  key={st.id || st.student_id}
                  onClick={() => handleOpenCoPilot(st)}
                  className={`bg-zinc-900 border rounded-2xl p-4 shadow-xl transition cursor-pointer flex flex-col gap-3 group relative overflow-hidden ${
                    isHandUp
                      ? 'border-amber-500/60 ring-1 ring-amber-500/40 shadow-amber-500/5'
                      : st.status === 'blunder'
                      ? 'border-rose-500/60 ring-1 ring-rose-500/40'
                      : 'border-zinc-800 hover:border-orange-500/50'
                  }`}
                >
                  {/* Top Student Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1 rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner">
                        {st.avatar}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-white group-hover:text-orange-400 transition block">
                          {st.student_name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Last: <strong className="text-zinc-300">{st.last_move || 'None'}</strong> • Eval: <strong className="text-orange-400">{st.eval_score}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isHandUp && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <Hand className="w-3 h-3 text-amber-400" /> HELP
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          st.status === 'solved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : st.status === 'blunder'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : st.status === 'active'
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {st.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Scaled Mini Board */}
                  <div className="w-full aspect-square pointer-events-none rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2 shadow-inner">
                    <ChessBoard chess={studentChess} interactive={false} orientation="w" />
                  </div>

                  {/* Footer with quick action */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                    <span className="flex items-center gap-1 text-zinc-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Student
                    </span>
                    <span className="text-orange-400 font-bold group-hover:underline flex items-center gap-1">
                      Inspect & Co-Pilot <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. Co-Pilot Modal (Coach Coaching Student Live)          */}
      {/* ========================================================= */}
      {coPilotStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-2xl bg-zinc-950 border border-zinc-800">
                  {coPilotStudent.avatar}
                </span>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Co-Pilot: {coPilotStudent.student_name}
                    {Boolean(coPilotStudent.hand_raised && coPilotStudent.hand_raised !== 0) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                        <Hand className="w-3 h-3" /> Raised Hand
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Make corrective moves or explain positional patterns directly to this student board.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCoPilotStudent(null)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Co-Pilot Board */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[420px] bg-zinc-950 border border-zinc-800 p-3 rounded-2xl shadow-inner">
                <ChessBoard
                  chess={coPilotChess}
                  onMove={handleCoPilotMove}
                  interactive={true}
                  orientation="w"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <div className="text-xs text-zinc-400">
                Status: <strong className="text-orange-400 uppercase">{coPilotStudent.status}</strong> • Eval: <strong className="text-emerald-400">{coPilotStudent.eval_score}</strong>
              </div>
              <div className="flex items-center gap-2">
                {Boolean(coPilotStudent.hand_raised && coPilotStudent.hand_raised !== 0) && (
                  <button
                    onClick={async () => {
                      if (token) {
                        await classroomService.setHandRaised(batchId, coPilotStudent.student_id, false, token);
                        setStudentBoards(prev => prev.map(s => s.student_id === coPilotStudent.student_id ? { ...s, hand_raised: 0 } : s));
                        setCoPilotStudent(prev => prev ? { ...prev, hand_raised: 0 } : null);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Lower Student Hand
                  </button>
                )}
                <button
                  onClick={() => setCoPilotStudent(null)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-xs font-bold text-white transition shadow-md shadow-orange-500/20"
                >
                  Done Co-Piloting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
