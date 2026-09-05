import React, { useState } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { Video, VideoOff, Mic, MicOff, Lock, Unlock, Users, ScreenShare, MessageSquare, Sparkles, Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import { ArrowAnnotation } from '../types/chess';
import { sounds } from '../utils/soundEffects';

interface StudentBoard {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'waiting' | 'solved';
  fen: string;
  moves: string[];
}

const SAMPLE_STUDENTS: StudentBoard[] = [
  { id: 'st-1', name: 'Aarav Sharma', avatar: '👦', status: 'active', fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Qf3'] },
  { id: 'st-2', name: 'Diya Patel', avatar: '👧', status: 'solved', fen: '6k1/5ppp/8/8/8/5Q2/4NPPP/2r3K1 w - - 0 1', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4'] },
  { id: 'st-3', name: 'Rohan Iyer', avatar: '🧑', status: 'active', fen: 'r3k2r/pppq1ppp/3p1n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'] },
  { id: 'st-4', name: 'Ananya Gupta', avatar: '👧', status: 'waiting', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', moves: ['e4'] },
  { id: 'st-5', name: 'Kabir Verma', avatar: '👦', status: 'active', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', moves: ['e4', 'e5', 'Nf3'] },
  { id: 'st-6', name: 'Meera Nair', avatar: '👧', status: 'solved', fen: '5rk1/1p3ppp/pq2p3/3p4/8/1P3Q2/P1r2PPP/R4RK1 w - - 0 20', moves: ['c4', 'e6', 'Nc3', 'd5', 'd4', 'Nf6'] },
];

export const ClassroomModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'master' | 'simul'>('master');
  const [chess] = useState<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [boardLocked, setBoardLocked] = useState<boolean>(false);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [camOn, setCamOn] = useState<boolean>(true);
  const [arrows, setArrows] = useState<ArrowAnnotation[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentBoard | null>(null);

  // Quick Classroom chat
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Coach Vikram', text: 'Welcome team! Today we are practicing king and rook endgame patterns.', time: '10:01 AM' },
    { sender: 'Aarav Sharma', text: 'Ready coach! Looking at f7.', time: '10:02 AM' },
    { sender: 'Diya Patel', text: 'Got the puzzle!', time: '10:03 AM' },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const handleMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (boardLocked) return;
    try {
      const move = chess.move({ from, to, promotion });
      if (move) {
        if (move.captured) sounds.playCapture();
        else sounds.playMove();
        if (chess.isCheck()) sounds.playCheck();
        setFen(chess.fen());
      }
    } catch {
      // Invalid
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { sender: 'Coach (You)', text: chatInput.trim(), time: 'Just now' }
    ]);
    setChatInput('');
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Classroom Top Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Advanced Tactics & Strategy — Batch Alpha</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>Coach: <strong>GM Vikram Sen</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 6 Students connected</span>
            </p>
          </div>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('master')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'master' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Master Board
            </button>
            <button
              onClick={() => setActiveTab('simul')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'simul' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Simul Grid (6 Boards)
            </button>
          </div>

          {/* Coach Board Lock */}
          <button
            onClick={() => setBoardLocked(prev => !prev)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              boardLocked
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
            title={boardLocked ? 'Unlock student move control' : 'Lock student moves (Coach only)'}
          >
            {boardLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {boardLocked ? 'Board Locked' : 'Unlocked'}
          </button>

          {/* Mic & Cam */}
          <button
            onClick={() => setMicOn(prev => !prev)}
            className={`p-2 rounded-xl border text-xs transition ${
              micOn ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCamOn(prev => !prev)}
            className={`p-2 rounded-xl border text-xs transition ${
              camOn ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Classroom Area */}
      {activeTab === 'master' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Board (Col 8) */}
          <div className="lg:col-span-8 flex flex-col items-center gap-3">
            <div className="w-full max-w-[580px]">
              <ChessBoard
                chess={chess}
                onMove={handleMove}
                orientation="w"
                interactive={!boardLocked}
                arrows={arrows}
                onAddArrow={(arr) => setArrows(prev => [...prev, arr])}
                onClearAnnotations={() => setArrows([])}
              />
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center justify-between w-full max-w-[580px]">
              <span>💡 Coach annotations are synchronized live to all connected student screens.</span>
              <button
                onClick={() => setArrows([])}
                className="text-orange-400 hover:underline font-semibold"
              >
                Clear Arrows
              </button>
            </div>
          </div>

          {/* Classroom Side Panel: Video Stream & Chat (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Coach Video Stream Tile */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-950 relative flex items-center justify-center">
                {camOn ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-500/30 text-orange-400 text-2xl flex items-center justify-center mx-auto border-2 border-orange-500/50">
                      👨‍🏫
                    </div>
                    <span className="text-xs font-bold text-zinc-200 mt-2 block">GM Vikram Sen (Host)</span>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <VideoOff className="w-4 h-4" /> Camera Off
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-zinc-200">
                  HD 1080p • Low Latency
                </div>
              </div>
            </div>

            {/* Live Chat Box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col h-[320px]">
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800 text-xs font-bold text-zinc-300">
                <MessageSquare className="w-4 h-4 text-orange-400" /> Classroom Discussion
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2.5 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-400">{msg.sender}</span>
                      <span className="text-[10px] text-zinc-500">{msg.time}</span>
                    </div>
                    <p className="text-zinc-300 leading-snug">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question or explain idea..."
                  className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Simul Multi-Board Grid (Coach watching all students) */
        <div className="flex flex-col gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-orange-300 font-medium">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <span>
                <strong>Simul Mode Active:</strong> You are monitoring 6 active student boards simultaneously. Click any board to inspect or coach directly.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('master')}
              className="text-xs font-bold text-orange-400 hover:underline"
            >
              Back to Master Board →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_STUDENTS.map((st) => {
              const studentChess = new Chess(st.fen);
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudent(st)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/60 rounded-xl p-3 shadow-lg transition cursor-pointer flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{st.avatar}</span>
                      <span className="font-bold text-xs text-white group-hover:text-orange-400 transition">
                        {st.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.status === 'solved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : st.status === 'active'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {st.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Scaled Mini Board */}
                  <div className="w-full aspect-square pointer-events-none rounded-lg overflow-hidden border border-zinc-800">
                    <ChessBoard chess={studentChess} interactive={false} orientation="w" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span>Moves: {st.moves.slice(-3).join(', ')}</span>
                    <span className="text-orange-400 font-semibold group-hover:underline">Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
