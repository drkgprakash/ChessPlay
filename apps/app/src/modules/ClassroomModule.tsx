import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { 
  Video, VideoOff, Mic, MicOff, Lock, Unlock, Users, MessageSquare, 
  Sparkles, Eye, ShieldCheck, Hand, AlertTriangle, CheckCircle2, 
  RotateCcw, Send, Zap, X, ArrowRight, HelpCircle, Download, Copy, 
  BookOpen, Monitor, MonitorOff, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, FileText, Check, Volume2, VolumeX,
  Radio, Play, Swords
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
import { MASTER_GAMES, MasterGame } from '../data/masterGames';
import { generateFidePgn, downloadPgnFile, copyToClipboard } from '../utils/pgnExporter';

const DEFAULT_STUDENT_BOARDS: StudentBoardState[] = [
  {
    id: 'sb-1',
    student_id: 'st-1',
    student_name: 'Aarav Sharma',
    avatar: '👦',
    current_fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
    last_move: 'Nf6',
    eval_score: '+1.4',
    status: 'active',
    hand_raised: 0
  },
  {
    id: 'sb-2',
    student_id: 'st-2',
    student_name: 'Diya Patel',
    avatar: '👧',
    current_fen: '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1',
    last_move: 'cxd4',
    eval_score: '-0.8',
    status: 'blunder',
    hand_raised: 0
  },
  {
    id: 'sb-3',
    student_id: 'st-3',
    student_name: 'Rohan Iyer',
    avatar: '🧑',
    current_fen: 'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8',
    last_move: 'Nf6',
    eval_score: '+2.1',
    status: 'active',
    hand_raised: 0
  },
  {
    id: 'sb-4',
    student_id: 'st-4',
    student_name: 'Ananya Gupta',
    avatar: '👧',
    current_fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    last_move: 'e4',
    eval_score: '0.0',
    status: 'waiting',
    hand_raised: 0
  },
  {
    id: 'sb-5',
    student_id: 'st-5',
    student_name: 'Kabir Verma',
    avatar: '👦',
    current_fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    last_move: 'Nf3',
    eval_score: '+3.6',
    status: 'active',
    hand_raised: 0
  },
  {
    id: 'sb-6',
    student_id: 'st-6',
    student_name: 'Meera Nair',
    avatar: '👧',
    current_fen: '5rk1/1p3ppp/pq2p3/3p4/8/1P3Q2/P1r2PPP/R4RK1 w - - 0 20',
    last_move: 'Nf6',
    eval_score: '-1.2',
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
  const [simulBroadcastNotice, setSimulBroadcastNotice] = useState<string | null>(null);

  // Student's Dedicated Interactive Board State (for !isCoach)
  const [myStudentId, setMyStudentId] = useState<string>('st-1');
  const [studentChess] = useState<Chess>(new Chess());
  const [studentFen, setStudentFen] = useState<string>('');
  
  // Co-Pilot Modal State (Coach -> Student)
  const [coPilotStudent, setCoPilotStudent] = useState<StudentBoardState | null>(null);
  const [coPilotChess] = useState<Chess>(new Chess());
  const [coPilotFen, setCoPilotFen] = useState<string>('');

  // AV & Interaction State
  const [micOn, setMicOn] = useState<boolean>(true);
  const [camOn, setCamOn] = useState<boolean>(true);
  const [isMyHandRaised, setIsMyHandRaised] = useState<boolean>(false);

  // Real Media AV & Screen Share
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isCamStreaming, setIsCamStreaming] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [audioWave, setAudioWave] = useState<number[]>([35, 65, 90, 55, 75]);

  // PGN Export & Study Library State
  const [showPgnModal, setShowPgnModal] = useState<boolean>(false);
  const [showStudyModal, setShowStudyModal] = useState<boolean>(false);
  const [pgnNotice, setPgnNotice] = useState<string | null>(null);
  const [customPgnInput, setCustomPgnInput] = useState<string>('');
  const [activeStudyGame, setActiveStudyGame] = useState<MasterGame | null>(null);

  // Classroom Discussion Chat
  const [chatMessages, setChatMessages] = useState<ClassroomChatMessage[]>([]);
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
            setBoardLocked(Boolean(snapshot.session.is_locked));
            if (snapshot.session.master_fen && snapshot.session.master_fen !== chess.fen()) {
              try {
                chess.load(snapshot.session.master_fen);
                setFen(snapshot.session.master_fen);
              } catch {}
            }
            if (Array.isArray(snapshot.session.active_arrows)) {
              setArrows(snapshot.session.active_arrows);
            }
          }

          if (snapshot.student_boards && snapshot.student_boards.length > 0) {
            setStudentBoards(snapshot.student_boards);
          }

          if (snapshot.my_student_id) {
            setMyStudentId(snapshot.my_student_id);
          }

          // Initialize student's personal board if student
          if (!isCoach) {
            const sid = snapshot.my_student_id || 'st-1';
            const matching = (snapshot.student_boards || []).find(s => s.student_id === sid || s.student_id === user?.id) || snapshot.student_boards?.[0];
            if (matching && matching.current_fen) {
              try {
                studentChess.load(matching.current_fen);
                setStudentFen(matching.current_fen);
                setIsMyHandRaised(Boolean(matching.hand_raised && matching.hand_raised !== 0));
              } catch {}
            }
          }

          if (snapshot.chat_messages && snapshot.chat_messages.length > 0) {
            setChatMessages(snapshot.chat_messages);
          } else {
            setChatMessages([
              { 
                id: 1, 
                sender: 'GM Vikram Sen (Coach)', 
                role: 'head_coach', 
                text: 'Welcome team! Live interactive masterclass is now in session. Follow along or practice on your simul board.', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              }
            ]);
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
  }, [batchId, token, isCoach, user?.id]);

  // Delta Polling Loop (sub-second real-time sync)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const delta = await classroomService.pollSync(batchId, lastEventIdRef.current, token);
        if (!delta || delta.status !== 'success') return;

        setSyncStatus('connected');

        // Process session updates (lock state, master FEN)
        if (delta.session) {
          setBoardLocked(Boolean(delta.session.is_locked));
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
                } catch {}
              }
            } else if (ev.event_type === 'board_lock') {
              setBoardLocked(Boolean(ev.payload?.is_locked));
            } else if (ev.event_type === 'arrow_draw') {
              setArrows(ev.payload?.arrows || []);
            } else if (ev.event_type === 'simul_reset' && ev.payload?.fen) {
              // Master broadcasted position to all simul boards
              if (!isCoach) {
                try {
                  studentChess.load(ev.payload.fen);
                  setStudentFen(ev.payload.fen);
                  sounds.playMove();
                  setSimulBroadcastNotice('Coach GM Vikram pushed new tactical position to your board!');
                  setTimeout(() => setSimulBroadcastNotice(null), 4000);
                } catch {}
              }
            } else if (ev.event_type === 'raise_hand') {
              // Sound alert for coach when a student raises hand
              if (isCoach && ev.payload?.hand_raised) {
                sounds.playCheck();
              }
            } else if (ev.event_type === 'chat_message' && ev.payload?.text) {
              const newMsg: ClassroomChatMessage = {
                id: ev.id,
                sender: ev.user_name || 'Participant',
                role: ev.user_role || 'student',
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

        // Update student boards list
        if (delta.student_boards && delta.student_boards.length > 0) {
          setStudentBoards(delta.student_boards);

          // If student: update personal board if coach co-piloted or moved
          if (!isCoach) {
            const sid = myStudentId || 'st-1';
            const updatedMyBoard = delta.student_boards.find(s => s.student_id === sid || s.student_id === user?.id);
            if (updatedMyBoard && updatedMyBoard.current_fen && updatedMyBoard.current_fen !== studentChess.fen()) {
              try {
                studentChess.load(updatedMyBoard.current_fen);
                setStudentFen(updatedMyBoard.current_fen);
                sounds.playMove();
              } catch {}
            }
            if (updatedMyBoard) {
              setIsMyHandRaised(Boolean(updatedMyBoard.hand_raised && updatedMyBoard.hand_raised !== 0));
            }
          }
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
  }, [batchId, token, isCoach, myStudentId, user?.id]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Master Board Move Handler (Coach)
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

  // Student's Personal Simul Board Move Handler (Student -> Coach)
  const handleStudentPersonalMove = async (from: Square, to: Square, promotion?: PieceSymbol) => {
    try {
      const move = studentChess.move({ from, to, promotion });
      if (move) {
        if (move.captured) sounds.playCapture();
        else sounds.playMove();
        if (studentChess.isCheck()) sounds.playCheck();

        const newFen = studentChess.fen();
        setStudentFen(newFen);

        // Submit move to backend so coach sees it immediately
        if (token) {
          const sid = myStudentId || 'st-1';
          await classroomService.submitStudentMove(
            batchId,
            sid,
            newFen,
            move.san,
            studentChess.turn() === 'w' ? '+0.4' : '-0.4',
            'active',
            token
          );
        }

        // Optimistically update local student board
        setStudentBoards(prev => prev.map(s => 
          (s.student_id === myStudentId || s.student_id === user?.id)
            ? { ...s, current_fen: newFen, last_move: move.san, status: 'active' }
            : s
        ));
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

  // Coach broadcasts position to all 6 student boards
  const handleBroadcastToSimul = async () => {
    if (!isCoach || !token) return;
    const targetFen = chess.fen();
    const ok = await classroomService.broadcastToSimul(batchId, targetFen, token);
    if (ok) {
      sounds.playSuccess();
      setSimulBroadcastNotice('Current master position successfully broadcasted to all 6 student boards!');
      setStudentBoards(prev => prev.map(s => ({
        ...s,
        current_fen: targetFen,
        last_move: 'Reset by Coach',
        status: 'active'
      })));
      setTimeout(() => setSimulBroadcastNotice(null), 4000);
    }
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

  // Toggle Hand Raise (Student or Coach)
  const handleToggleHandRaise = async () => {
    const nextState = !isMyHandRaised;
    setIsMyHandRaised(nextState);
    sounds.playMove();
    if (token) {
      const sid = myStudentId || user?.id || 'st-1';
      await classroomService.setHandRaised(batchId, sid, nextState, token);
      setStudentBoards(prev => prev.map(s => 
        (s.student_id === sid || s.student_id === user?.id)
          ? { ...s, hand_raised: nextState ? 1 : 0 }
          : s
      ));
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || chatInput).trim();
    if (!textToSend) return;

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
            sender: user?.name ? `${user.name} (${isCoach ? 'Coach' : 'Student'})` : 'You',
            role: user?.role || 'student',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  };

  // Waveform animation
  useEffect(() => {
    if (!micOn) return;
    const interval = setInterval(() => {
      setAudioWave([
        Math.floor(20 + Math.random() * 75),
        Math.floor(30 + Math.random() * 65),
        Math.floor(40 + Math.random() * 55),
        Math.floor(25 + Math.random() * 70),
        Math.floor(35 + Math.random() * 60)
      ]);
    }, 280);
    return () => clearInterval(interval);
  }, [micOn]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Toggle Camera Stream
  const handleToggleCam = async () => {
    if (isCamStreaming) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCamStreaming(false);
      setCamOn(false);
    } else {
      setCamOn(true);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setIsCamStreaming(true);
        }
      } catch {
        setIsCamStreaming(false);
      }
    }
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setIsScreenSharing(true);
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            if (videoRef.current) videoRef.current.srcObject = null;
          };
        }
      } catch {
        setIsScreenSharing(false);
      }
    }
  };

  // PGN Actions
  const handleDownloadPgn = () => {
    const pgn = generateFidePgn(chess, {
      event: "Achiever's Chess Academy Live Masterclass — Batch Alpha",
      site: "ChessPlay.in",
      round: "Masterclass Lecture",
      white: "GM Vikram Sen",
      black: "Batch Alpha Students"
    });
    const filename = `ChessPlay_Masterclass_${batchId}_${Date.now()}.pgn`;
    downloadPgnFile(filename, pgn);
    setPgnNotice('PGN game file downloaded!');
    setShowPgnModal(false);
    setTimeout(() => setPgnNotice(null), 3500);
  };

  const handleCopyPgn = async () => {
    const pgn = generateFidePgn(chess, {
      event: "Achiever's Chess Academy Live Masterclass — Batch Alpha",
      white: "GM Vikram Sen",
      black: "Batch Alpha Students"
    });
    const ok = await copyToClipboard(pgn);
    if (ok) {
      setPgnNotice('Standard FIDE PGN copied to clipboard!');
      setShowPgnModal(false);
      setTimeout(() => setPgnNotice(null), 3500);
    }
  };

  const handleCopyFen = async () => {
    const ok = await copyToClipboard(chess.fen());
    if (ok) {
      setPgnNotice('Current board FEN copied to clipboard!');
      setShowPgnModal(false);
      setTimeout(() => setPgnNotice(null), 3500);
    }
  };

  // Load Master Game
  const handleLoadMasterGame = async (game: MasterGame) => {
    try {
      const c = new Chess(game.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      for (const m of game.moves) {
        c.move(m);
      }
      chess.load(c.fen());
      setFen(c.fen());
      setActiveStudyGame(game);
      setShowStudyModal(false);
      sounds.playMove();

      if (token) {
        await classroomService.broadcastMove(batchId, c.fen(), `Loaded: ${game.title}`, token);
      }
      setPgnNotice(`Loaded "${game.title}" onto Master Board!`);
      setTimeout(() => setPgnNotice(null), 4000);
    } catch {
      alert('Unable to load master game.');
    }
  };

  // Import Custom PGN or FEN
  const handleImportCustom = async () => {
    const input = customPgnInput.trim();
    if (!input) return;

    try {
      const testChess = new Chess();
      if (input.includes('/') && !input.includes('[')) {
        testChess.load(input);
        chess.load(input);
      } else {
        testChess.loadPgn(input);
        chess.loadPgn(input);
      }
      setFen(chess.fen());
      sounds.playMove();
      setShowStudyModal(false);
      setCustomPgnInput('');
      if (token && isCoach) {
        await classroomService.broadcastMove(batchId, chess.fen(), 'Imported Custom Study', token);
      }
      setPgnNotice('Custom study successfully imported onto Master Board!');
      setTimeout(() => setPgnNotice(null), 4000);
    } catch {
      alert('Invalid PGN or FEN format. Please check and try again.');
    }
  };

  // Step Undo 1 move
  const handleStepPrev = async () => {
    try {
      const undone = chess.undo();
      if (undone) {
        sounds.playMove();
        const nextFen = chess.fen();
        setFen(nextFen);
        if (token && isCoach) {
          await classroomService.broadcastMove(batchId, nextFen, `Step: ${undone.san}`, token);
        }
      }
    } catch {}
  };

  // Reset to Start
  const handleStepReset = async () => {
    chess.reset();
    sounds.playMove();
    const nextFen = chess.fen();
    setFen(nextFen);
    setActiveStudyGame(null);
    if (token && isCoach) {
      await classroomService.broadcastMove(batchId, nextFen, 'Reset to move 1', token);
    }
  };

  // Open Co-Pilot Modal for a student
  const handleOpenCoPilot = (student: StudentBoardState) => {
    setCoPilotStudent(student);
    try {
      coPilotChess.load(student.current_fen);
    } catch {
      coPilotChess.reset();
    }
    setCoPilotFen(coPilotChess.fen());
  };

  // Make move in Co-Pilot (Coach plays move on student board)
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
            coPilotChess.turn() === 'w' ? '+1.2' : '-1.2',
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

  // Filtered student boards for Simul Radar
  const filteredBoards = studentBoards.filter(st => {
    if (simulFilter === 'blunders') return st.status === 'blunder';
    if (simulFilter === 'hands') return Boolean(st.hand_raised && st.hand_raised !== 0);
    return true;
  });

  // Current student personal board
  const myCurrentBoard = studentBoards.find(s => s.student_id === myStudentId || s.student_id === user?.id) || studentBoards[0];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
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
              {isCoach ? (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                  Coach Mode
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  Student: {user?.name || 'Aarav Sharma'}
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-3 mt-1 font-medium">
              <span>Head Coach: <strong className="text-zinc-200">GM Vikram Sen</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <Users className="w-3.5 h-3.5 text-orange-400" /> {studentBoards.length} Students Connected
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400/90">
                <Zap className="w-3 h-3 text-emerald-400" /> Sub-Second Live Sync Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Hand Raise Alert Pill (Coach Alert) */}
          {isCoach && raisedHandsCount > 0 && (
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

          {/* View Switcher: Master Board vs Simul */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'master' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isCoach ? 'Master Lecture Board' : 'Coach Lecture'}
            </button>
            <button
              onClick={() => setActiveTab('simul')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'simul' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isCoach ? (
                <>
                  <Eye className="w-3.5 h-3.5" /> Simul Grid (6 Boards)
                  {blundersCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </>
              ) : (
                <>
                  <Swords className="w-3.5 h-3.5 text-orange-400" /> My Simul Board vs Coach
                </>
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
              onClick={handleToggleCam}
              className={`p-2 rounded-lg text-xs transition ${
                isCamStreaming || camOn ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-rose-500/20 text-rose-300'
              }`}
              title={isCamStreaming || camOn ? 'Stop Camera' : 'Start Camera Stream'}
            >
              {isCamStreaming || camOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggleScreenShare}
              className={`p-2 rounded-lg text-xs transition ${
                isScreenSharing ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen in Masterclass'}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast alert banner */}
      {simulBroadcastNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{simulBroadcastNotice}</span>
          </div>
          <button onClick={() => setSimulBroadcastNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

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
                    <strong>Master Board Locked:</strong> Coach GM Vikram Sen has locked move inputs. Please follow along on screen.
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
            <div className="w-full max-w-[600px] bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-2xl space-y-3">
              <ChessBoard
                chess={chess}
                onMove={handleMasterMove}
                orientation="w"
                interactive={isCoach || !boardLocked}
                arrows={arrows}
                onAddArrow={handleAddArrow}
                onClearAnnotations={handleClearArrows}
              />

              {/* Move Navigation & PGN Actions Bar */}
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleStepReset}
                    className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
                    title="Jump to Start (Reset)"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleStepPrev}
                    className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
                    title="Step Backward (Undo Move)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-zinc-400 px-2 py-1 rounded bg-zinc-950 border border-zinc-800">
                    {chess.history().length} Moves ({Math.ceil(chess.history().length / 2)} Plies)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStudyModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-orange-400" /> Study Library
                  </button>
                  <button
                    onClick={() => setShowPgnModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-400" /> Export PGN
                  </button>
                </div>
              </div>
            </div>

            {/* Coach Presets Bar (Coach Only) */}
            {isCoach && (
              <div className="w-full max-w-[600px] bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Lecture Presets:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_POSITIONS.map((pos, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadPreset(pos.fen)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-orange-400 transition font-medium"
                    >
                      {pos.label}
                    </button>
                  ))}
                  <button
                    onClick={handleClearArrows}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 transition"
                  >
                    Clear Arrows
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AV Stage, Video Strip & Classroom Discussion (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* AV Stream Stage Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
                {isCamStreaming || isScreenSharing ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    {camOn ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/30">
                          ♟️
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">GM Vikram Sen</div>
                          <div className="text-xs text-orange-400 font-medium">Head Coach Broadcast</div>
                        </div>

                        {/* Live Audio Waveform */}
                        {micOn ? (
                          <div className="flex items-center gap-1 h-5 mt-2">
                            {audioWave.map((h, i) => (
                              <div
                                key={i}
                                className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                                style={{ height: `${h}px` }}
                              />
                            ))}
                            <span className="text-[9px] font-mono text-emerald-400 font-bold ml-1">MIC LIVE</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-mono text-zinc-500 font-medium mt-2 flex items-center gap-1">
                            <VolumeX className="w-3 h-3 text-zinc-500" /> Mic Muted
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                          <VideoOff className="w-5 h-5" />
                        </div>
                        <span>Camera Stream Paused</span>
                        <span className="text-[10px] text-zinc-600">Click camera button to resume broadcast</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Overlays / Stream Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                  <div className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {isScreenSharing ? 'SCREEN CAST' : isCamStreaming ? 'LIVE WEBCAM' : '1080p 60FPS'}
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-zinc-300 z-20">
                  Latency: 28ms
                </div>

                {isScreenSharing && (
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-blue-500/80 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1 z-20">
                    <Monitor className="w-3 h-3" /> Sharing Screen
                  </div>
                )}
              </div>

              {/* Student Video Stage Strip (6 Attendees) */}
              <div className="p-3 bg-zinc-950/80 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-400" /> Student Video Strip ({studentBoards.length})
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    All Connected
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {studentBoards.map((st, i) => {
                    const isHand = Boolean(st.hand_raised && st.hand_raised !== 0);
                    const isSpeaking = i % 3 === 1; // Live audio activity indicator
                    return (
                      <div
                        key={st.student_id}
                        onClick={() => {
                          if (isCoach) {
                            handleOpenCoPilot(st);
                          }
                        }}
                        className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition cursor-pointer ${
                          isHand
                            ? 'bg-amber-500/15 border-amber-500/50 hover:bg-amber-500/25 ring-1 ring-amber-500/30'
                            : 'bg-zinc-900/90 border-zinc-800 hover:border-orange-500/40 hover:bg-zinc-800/80'
                        }`}
                        title={isCoach ? `Click to Co-Pilot ${st.student_name}` : st.student_name}
                      >
                        <div className="relative mb-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center border border-zinc-700 group-hover:scale-105 transition-transform">
                            {st.avatar || st.student_name.charAt(0)}
                          </div>
                          {isHand && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black flex items-center justify-center animate-bounce shadow">
                              ✋
                            </span>
                          )}
                          {isSpeaking && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300 truncate max-w-full text-center">
                          {st.student_name.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500">
                          {st.eval_score || '0.0'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Real-Time Live Chat */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col h-[340px]">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <MessageSquare className="w-4 h-4 text-orange-400" /> Classroom Discussion
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Sync
                </span>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 text-xs pr-1">
                {chatMessages.map((msg, idx) => {
                  const isCoachSender = msg.role === 'head_coach' || msg.role === 'academy_admin' || msg.sender.toLowerCase().includes('coach');
                  return (
                    <div 
                      key={msg.id || idx} 
                      className={`flex flex-col gap-1 p-2.5 rounded-xl border ${
                        isCoachSender
                          ? 'bg-orange-950/20 border-orange-500/30'
                          : 'bg-zinc-950/70 border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-[11px] flex items-center gap-1.5 ${
                          isCoachSender ? 'text-orange-400' : 'text-blue-400'
                        }`}>
                          {isCoachSender && <span>👨‍🏫</span>}
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-zinc-200 leading-snug">{msg.text}</p>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Reactions Chips */}
              <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, '♟️ Ready coach! Watching the moves.')}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap transition"
                >
                  ♟️ Ready!
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, '❓ Need clarification on this pawn structure')}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap transition"
                >
                  ❓ Question
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, '💡 Found knight fork tactic on f7!')}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 whitespace-nowrap transition"
                >
                  💡 Found tactic!
                </button>
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isCoach ? "Broadcast explanation to classroom..." : "Ask coach or share tactical idea..."}
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
      ) : isCoach ? (
        /* ========================================================= */
        /* 3A. COACH PERSPECTIVE: Simul Multi-Board Grid (6 Boards)  */
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
                  Inspect student moves in real-time, test alternative lines, or co-pilot critical endgame moves.
                </p>
              </div>
            </div>

            {/* Filter Tabs & Broadcast Action */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={handleBroadcastToSimul}
                className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Push current Master Board position to all 6 students"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Broadcast Position to All Boards
              </button>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
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
          </div>

          {/* 6-Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBoards.map((st) => {
              const studentChessPreview = new Chess();
              try {
                studentChessPreview.load(st.current_fen);
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
                      ? 'border-amber-500/60 ring-2 ring-amber-500/40 shadow-amber-500/10'
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
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-bounce">
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
                    <ChessBoard chess={studentChessPreview} interactive={false} orientation="w" />
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
      ) : (
        /* ========================================================= */
        /* 3B. STUDENT PERSPECTIVE: Dedicated Interactive Simul Board*/
        /* ========================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          {/* Main Board Column (Col 8) */}
          <div className="lg:col-span-8 flex flex-col items-center gap-4">
            {/* Matchup Header Banner */}
            <div className="w-full max-w-[600px] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              {/* Opponent Coach */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-lg shadow">
                  👨‍🏫
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    GM Vikram Sen <span className="text-[10px] text-orange-400">(Coach)</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    2650 FIDE GM • Playing White
                  </div>
                </div>
              </div>

              {/* Status / Eval */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {isMyHandRaised && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 animate-pulse">
                      <Hand className="w-3 h-3" /> Hand Raised
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                    Live Simul Match
                  </span>
                </div>
                <div className="text-xs text-zinc-300 mt-1 font-semibold">
                  Turn: <strong className="text-orange-400">{studentChess.turn() === 'w' ? 'White to move' : 'Black to move'}</strong>
                </div>
              </div>
            </div>

            {/* Student's Interactive Board */}
            <div className="w-full max-w-[600px] bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-2xl space-y-3">
              <ChessBoard
                chess={studentChess}
                onMove={handleStudentPersonalMove}
                orientation="w"
                interactive={true}
              />

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-1 rounded bg-zinc-950 border border-zinc-800">
                    Last: <strong className="text-orange-400">{myCurrentBoard?.last_move || 'None'}</strong>
                  </span>
                  <span className="font-mono text-[11px] px-2 py-1 rounded bg-zinc-950 border border-zinc-800">
                    Eval: <strong className="text-emerald-400">{myCurrentBoard?.eval_score || '0.0'}</strong>
                  </span>
                </div>

                <button
                  onClick={handleToggleHandRaise}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                    isMyHandRaised
                      ? 'bg-amber-500 text-black border-amber-400 font-black'
                      : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  {isMyHandRaised ? 'Lower Hand ✋' : 'Ask Question / Raise Hand ✋'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Rail: Classroom Peers Mini-Grid (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Users className="w-4 h-4 text-orange-400" />
                  Classroom Peers ({studentBoards.length})
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Batch Alpha</span>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {studentBoards.map((peer) => {
                  const isMe = peer.student_id === myStudentId || peer.student_id === user?.id;
                  const peerHand = Boolean(peer.hand_raised && peer.hand_raised !== 0);

                  return (
                    <div
                      key={peer.student_id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        isMe
                          ? 'bg-orange-950/20 border-orange-500/50'
                          : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                          {peer.avatar}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {peer.student_name}
                            {isMe && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500 text-white font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            Last: {peer.last_move || '—'} • {peer.eval_score}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {peerHand && (
                          <span className="text-[10px] text-amber-400 animate-bounce">
                            ✋
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          peer.status === 'blunder'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : peer.status === 'solved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {peer.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 animate-pulse">
                        <Hand className="w-3 h-3" /> Raised Hand
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Make corrective moves or demonstrate tactical patterns directly onto this student board in real time.
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

      {/* ========================================================= */}
      {/* 5. FIDE PGN Export Modal                                 */}
      {/* ========================================================= */}
      {showPgnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Export FIDE PGN & Game Notation</h3>
                  <p className="text-[11px] text-zinc-400">Official 7-tag roster, moves history, and clipboard sharing</p>
                </div>
              </div>
              <button
                onClick={() => setShowPgnModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PGN Code Block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Standard FIDE PGN Representation</span>
                <span className="font-mono text-zinc-500">{chess.history().length} plies played</span>
              </div>
              <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-[11px] font-mono text-zinc-300 max-h-60 overflow-y-auto whitespace-pre-wrap select-all leading-relaxed">
                {generateFidePgn(chess, {
                  event: "Achiever's Chess Academy Live Masterclass — Batch Alpha",
                  site: "ChessPlay.in",
                  round: "Masterclass Lecture",
                  white: "GM Vikram Sen",
                  black: "Batch Alpha Students"
                })}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleCopyFen}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" /> Copy FEN
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPgn}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-orange-400" /> Copy PGN
                </button>
                <button
                  onClick={handleDownloadPgn}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-xs font-bold text-white transition shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download .pgn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. GM Masterclass Study Library & PGN/FEN Importer       */}
      {/* ========================================================= */}
      {showStudyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">GM Masterclass Studies & PGN Importer</h3>
                  <p className="text-[11px] text-zinc-400">Load historic masterpiece games or paste custom notation onto Master Board</p>
                </div>
              </div>
              <button
                onClick={() => setShowStudyModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Curated Master Games */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Historic Grandmaster Games ({MASTER_GAMES.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MASTER_GAMES.map((game) => (
                  <div
                    key={game.id}
                    className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-orange-500/50 transition flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-orange-400 font-bold px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                          {game.eco} • {game.theme}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">{game.date}</span>
                      </div>
                      <h4 className="text-xs font-black text-white mt-1.5 group-hover:text-orange-300 transition">
                        {game.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {game.description}
                      </p>
                      <div className="text-[10px] text-zinc-500 font-mono mt-2">
                        {game.white} vs {game.black} ({game.result})
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadMasterGame(game)}
                      className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Load into Classroom
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Custom PGN / FEN Importer */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-zinc-800">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-orange-400" /> Import Custom PGN or FEN String
              </span>
              <p className="text-[11px] text-zinc-400">
                Paste any standard PGN text or FEN board position to immediately broadcast to all students:
              </p>
              <textarea
                rows={4}
                value={customPgnInput}
                onChange={(e) => setCustomPgnInput(e.target.value)}
                placeholder="Paste PGN (e.g. 1. e4 e5 2. Nf3 Nc6 3. Bb5...) or FEN position..."
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setCustomPgnInput('');
                    setShowStudyModal(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCustom}
                  disabled={!customPgnInput.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-xs font-bold text-white transition shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Import & Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
