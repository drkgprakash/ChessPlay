import React, { useState } from 'react';
import { StudentProgress } from '../types/chess';
import { Users, Calendar, CheckSquare, FileText, Send, Plus, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';

const STUDENTS_ROSTER: StudentProgress[] = [
  { id: 'st-1', name: 'Aarav Sharma', avatar: '👦', rating: 1640, puzzlesSolved: 142, attendancePct: 96, homeworkScorePct: 94, recentForm: ['W', 'W', 'W', 'D'], coachNotes: 'Excellent understanding of central pawn levers. Working on rook and pawn endgames.' },
  { id: 'st-2', name: 'Diya Patel', avatar: '👧', rating: 1580, puzzlesSolved: 128, attendancePct: 92, homeworkScorePct: 88, recentForm: ['W', 'W', 'L', 'W'], coachNotes: 'Sharp attacking instincts in Sicilian Najdorf. Needs to tighten defensive king safety.' },
  { id: 'st-3', name: 'Rohan Iyer', avatar: '🧑', rating: 1520, puzzlesSolved: 110, attendancePct: 88, homeworkScorePct: 85, recentForm: ['W', 'D', 'W', 'L'], coachNotes: 'Good positional instincts. Recommended more tactical puzzle drills on pins.' },
  { id: 'st-4', name: 'Kabir Verma', avatar: '👦', rating: 1490, puzzlesSolved: 95, attendancePct: 85, homeworkScorePct: 80, recentForm: ['L', 'W', 'W', 'L'], coachNotes: 'Pawn structures improving nicely. Advised to review London system theory.' },
  { id: 'st-5', name: 'Ananya Gupta', avatar: '👧', rating: 1430, puzzlesSolved: 115, attendancePct: 95, homeworkScorePct: 91, recentForm: ['W', 'L', 'W', 'W'], coachNotes: 'Very diligent with homework. Strong progress in middle-game planning.' },
];

export const AcademyModule: React.FC = () => {
  const [students, setStudents] = useState<StudentProgress[]>(STUDENTS_ROSTER);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress>(STUDENTS_ROSTER[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reportSent, setReportSent] = useState<boolean>(false);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReport = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Students</span>
            <div className="text-2xl font-black text-white mt-1">124</div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +12 this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl">
            ♟️
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg Attendance</span>
            <div className="text-2xl font-black text-white mt-1">94.2%</div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 block">
              18 batches active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl">
            📅
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Homework Done</span>
            <div className="text-2xl font-black text-white mt-1">89.6%</div>
            <span className="text-[11px] text-orange-400 font-semibold mt-0.5 block">
              410 puzzles solved this week
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
            📝
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rating Avg</span>
            <div className="text-2xl font-black text-white mt-1">1,532</div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +42 pts gain
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl">
            🏆
          </div>
        </div>
      </div>

      {/* Main Student Roster & Parent Report Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Student List (Col 7) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Student Roster</h3>
              <p className="text-xs text-zinc-400">Manage enrollment, attendance, and homework progression</p>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition">
              <Plus className="w-3.5 h-3.5" /> Add Student
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3 text-center">Rating</th>
                  <th className="py-2.5 px-3 text-center">Attendance</th>
                  <th className="py-2.5 px-3 text-center">Homework</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className={`cursor-pointer transition ${
                      selectedStudent.id === st.id ? 'bg-orange-500/10' : 'hover:bg-zinc-800/30'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{st.avatar}</span>
                        <div>
                          <div className="font-bold text-zinc-200">{st.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">ID: {st.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-orange-400">
                      {st.rating}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        {st.attendancePct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                        {st.homeworkScorePct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(st);
                        }}
                        className="text-xs font-semibold text-orange-400 hover:underline"
                      >
                        View Card →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Student Card & Automated Parent Report (Col 5) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Parent Report Generator
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              Ready to Send
            </span>
          </div>

          {/* Student Profile Snapshot */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-2xl flex items-center justify-center">
              {selectedStudent.avatar}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{selectedStudent.name}</h4>
              <p className="text-xs text-zinc-400">FIDE Rating: <strong className="text-orange-400 font-mono">{selectedStudent.rating}</strong> • {selectedStudent.puzzlesSolved} Puzzles</p>
            </div>
          </div>

          {/* Report Preview */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-3 font-sans">
            <div className="font-bold text-zinc-200 border-b border-zinc-800 pb-1.5 flex items-center justify-between">
              <span>Chess Play Academy — Monthly Report</span>
              <span className="text-[10px] text-zinc-500">Auto-Generated</span>
            </div>

            <div className="space-y-1.5 text-zinc-300 leading-relaxed">
              <p>Dear Parents,</p>
              <p>
                <strong>{selectedStudent.name}</strong> has maintained an outstanding <strong>{selectedStudent.attendancePct}% attendance</strong> this month with a homework completion score of <strong>{selectedStudent.homeworkScorePct}%</strong>.
              </p>
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 my-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Coach Vikram's Remarks:</span>
                <p className="text-xs text-orange-200/90 italic">"{selectedStudent.coachNotes}"</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
              <span>Recent Form:</span>
              <div className="flex items-center gap-1 font-mono font-bold">
                {selectedStudent.recentForm.map((f, i) => (
                  <span
                    key={i}
                    className={`w-4 h-4 rounded text-[10px] flex items-center justify-center ${
                      f === 'W' ? 'bg-emerald-500 text-black' : f === 'D' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp & Email Delivery Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleSendReport}
              disabled={reportSent}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {reportSent ? 'Report Sent via WhatsApp & Email!' : 'Send WhatsApp Report to Parents'}
            </button>
            <button className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition">
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
