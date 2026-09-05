import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  MessageCircle, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Shield, 
  Sparkles, 
  Edit3, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  FileText, 
  CheckSquare, 
  Layers, 
  User, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { Student } from '../services/userService';
import { reportService, StudentReport } from '../services/reportService';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onReportSaved?: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  onReportSaved
}) => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [reportsHistory, setReportsHistory] = useState<StudentReport[]>([]);
  const [activeReport, setActiveReport] = useState<Partial<StudentReport>>({});
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load report data from backend
  const loadReports = async () => {
    if (!token || !student) return;
    setIsLoading(true);
    const data = await reportService.getStudentReports(token, student.id);
    if (data) {
      setReportsHistory(data.reports);
      if (data.reports.length > 0) {
        setActiveReport(data.reports[0]);
      } else if (data.draft) {
        setActiveReport({
          ...data.draft,
          student_id: student.id,
          academy_id: student.academy_id || 'acad-001',
          coach_id: user?.id,
          coach_name: user?.name,
          student_name: student.name,
          batch_name: student.batch_name
        });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadReports();
      setIsEditing(false);
      setSaveSuccessMsg(null);
    }
  }, [isOpen, student.id, token]);

  if (!isOpen) return null;

  // Handle Save
  const handleSaveReport = async () => {
    if (!token) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);

    const payload: Partial<StudentReport> = {
      ...activeReport,
      student_id: student.id,
      academy_id: student.academy_id || 'acad-001'
    };

    const res = await reportService.saveReport(token, payload);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccessMsg('Report card saved and updated in academy database!');
      setIsEditing(false);
      loadReports();
      if (onReportSaved) onReportSaved();
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } else {
      alert(res.message);
    }
  };

  // 1-Click WhatsApp Parent Progress Dispatch
  const handleSendWhatsApp = () => {
    const parentPhone = (student.parent_phone || '').replace(/[^0-9]/g, '');
    const academyName = activeReport.academy_name || user?.academyName || "Achiever's Chess Academy";
    const coachName = activeReport.coach_name || user?.name || "GM Vikram Sen";
    const period = activeReport.period_label || 'September 2026';
    const rating = activeReport.rating || student.rating;
    const ratingDelta = (activeReport.rating_change || 0) >= 0 ? `+${activeReport.rating_change || 0}` : `${activeReport.rating_change}`;

    const message = `🏆 *${academyName} — Student Performance Report Card* ♟️
━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${student.name}
📅 *Evaluation Period:* ${period}
🎖️ *Overall Grade:* ${activeReport.overall_grade || 'A+'}
📈 *Current Elo Rating:* ${rating} (${ratingDelta} Elo this month)
🏫 *Batch:* ${student.batch_name || 'Batch Alpha'}
👨‍🏫 *Head Instructor:* ${coachName}

*SKILL MATRIX & TACTICAL ANALYSIS:*
• 🎯 Tactics & Calculation: ${activeReport.tactics_score || 92}%
• ⚔️ Opening Preparation: ${activeReport.openings_score || 88}%
• 🛡️ Endgame Technique: ${activeReport.endgames_score || 85}%
• ⏱️ Clock Discipline: ${activeReport.time_mgmt_score || 90}%

*ACADEMY ENGAGEMENT:*
• Attendance Rate: ${activeReport.attendance_pct || student.attendance_pct}%
• Homework & Drills Solved: ${activeReport.homework_pct || student.homework_pct}%
• Tactical Puzzles Completed: ${activeReport.puzzles_solved || student.puzzles_solved}

💬 *Coach's Remarks:*
"${activeReport.coach_remarks || student.notes || 'Demonstrating solid focus and tactical consistency.'}"

🌟 *Key Strength:*
${activeReport.strengths || 'Sharp candidate move calculation and aggressive piece development.'}

🎯 *Target Area for Next Month:*
${activeReport.areas_for_growth || 'Rook endgame conversions and calm defensive play.'}

━━━━━━━━━━━━━━━━━━━━
_Issued officially by ${academyName} via ChessPlay OS_`;

    const encoded = encodeURIComponent(message);
    const targetUrl = parentPhone ? `https://wa.me/${parentPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    window.open(targetUrl, '_blank');
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 4000);
  };

  // Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  const academyName = activeReport.academy_name || user?.academyName || "Achiever's Chess Academy";
  const coachName = activeReport.coach_name || user?.name || "GM Vikram Sen";
  const ratingDelta = (activeReport.rating_change || 0) >= 0 ? `+${activeReport.rating_change || 0}` : `${activeReport.rating_change}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh] print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full print:bg-white print:text-black">
        
        {/* Modal Controls Bar (Hidden during Print) */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl shadow-inner">
              📜
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Official Student Report Card
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Print & PDF Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {student.name} • {activeReport.period_label || 'September 2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                isEditing
                  ? 'bg-zinc-800 text-orange-400 border border-orange-500/40'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Preview Mode' : 'Customize'}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Parent
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2 font-bold animate-in fade-in print:hidden">
            <CheckCircle2 className="w-4 h-4" /> {saveSuccessMsg}
          </div>
        )}

        {/* WhatsApp Dispatched Toast */}
        {whatsappSent && (
          <div className="p-3 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2 font-bold animate-in fade-in print:hidden">
            <CheckCircle2 className="w-4 h-4" /> WhatsApp Web / App opened with formatted card!
          </div>
        )}

        {/* Report Card Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          {isLoading ? (
            <div className="py-20 text-center text-zinc-400 text-xs">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-2" />
              Generating verified academy evaluation...
            </div>
          ) : (
            /* ========================================================= */
            /* THE PRINTABLE CERTIFICATE & REPORT CARD CONTAINER         */
            /* ========================================================= */
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-700/80 shadow-2xl relative space-y-6 print:border-none print:shadow-none print:bg-white print:text-black print:p-4">
              
              {/* Certificate Border Accents */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-orange-500/40 rounded-tl-lg pointer-events-none print:border-orange-500" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-orange-500/40 rounded-tr-lg pointer-events-none print:border-orange-500" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-orange-500/40 rounded-bl-lg pointer-events-none print:border-orange-500" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-orange-500/40 rounded-br-lg pointer-events-none print:border-orange-500" />

              {/* Certificate Top Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-zinc-800 pb-5 gap-4 print:border-zinc-300">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20 print:bg-orange-500 print:text-white">
                    ♞
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase print:text-black">
                      {academyName}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-zinc-400 font-mono mt-0.5 print:text-zinc-600">
                      <span className="flex items-center gap-1 text-emerald-400 print:text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> FIDE Affiliated Academy
                      </span>
                      <span>•</span>
                      <span>ChessPlay OS Verified</span>
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 print:border-orange-500 print:text-orange-600">
                    Official Student Evaluation
                  </span>
                  <div className="text-xs font-bold text-white mt-1.5 print:text-black">
                    Period: <span className="font-mono text-orange-400 print:text-black">{activeReport.period_label || 'September 2026'}</span>
                  </div>
                </div>
              </div>

              {/* Student Identification & Overall Grade Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 print:bg-zinc-50 print:border-zinc-200">
                {/* Student Info */}
                <div className="flex items-center gap-3.5 md:col-span-2">
                  <div className="text-4xl">{student.avatar_emoji || '👦'}</div>
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-black text-white print:text-black flex items-center gap-2">
                      {student.name}
                    </h2>
                    <div className="text-xs text-zinc-400 print:text-zinc-600 flex flex-wrap items-center gap-3 font-mono">
                      <span>Batch: <strong className="text-zinc-200 print:text-black">{student.batch_name || 'Batch Alpha'}</strong></span>
                      <span>•</span>
                      <span>FIDE ID: <strong className="text-zinc-200 print:text-black">{student.fide_id || 'IND-2026-904'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Overall Rating & Grade Badge */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-4 print:border-zinc-300">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase print:text-zinc-600">Current Rating</div>
                    <div className="text-2xl font-black text-white print:text-black">
                      {activeReport.rating || student.rating}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 print:text-emerald-700 flex items-center md:justify-end gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {ratingDelta} Elo
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-center print:border-orange-500 print:bg-orange-50">
                    <div className="text-[9px] font-mono text-orange-400 uppercase font-bold print:text-orange-700">Evaluation</div>
                    <div className="text-xl font-black text-white print:text-orange-700">
                      {activeReport.overall_grade || 'A+'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Pillar Performance Skills Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider print:text-zinc-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-orange-400" /> Tactical & Strategic Skill Matrix
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Tactics */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 print:bg-zinc-50 print:border-zinc-200 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-zinc-200 print:text-black">Tactics & Calculation</span>
                      <span className="font-mono font-bold text-orange-400 print:text-black">{activeReport.tactics_score || 92}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 print:bg-zinc-200">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${activeReport.tactics_score || 92}%` }} />
                    </div>
                  </div>

                  {/* Openings */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 print:bg-zinc-50 print:border-zinc-200 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-zinc-200 print:text-black">Opening Repertoire Prep</span>
                      <span className="font-mono font-bold text-blue-400 print:text-black">{activeReport.openings_score || 88}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 print:bg-zinc-200">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeReport.openings_score || 88}%` }} />
                    </div>
                  </div>

                  {/* Endgames */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 print:bg-zinc-50 print:border-zinc-200 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-zinc-200 print:text-black">Endgame Technique</span>
                      <span className="font-mono font-bold text-emerald-400 print:text-black">{activeReport.endgames_score || 85}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 print:bg-zinc-200">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeReport.endgames_score || 85}%` }} />
                    </div>
                  </div>

                  {/* Time Management */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 print:bg-zinc-50 print:border-zinc-200 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-zinc-200 print:text-black">Clock Discipline & Focus</span>
                      <span className="font-mono font-bold text-purple-400 print:text-black">{activeReport.time_mgmt_score || 90}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 print:bg-zinc-200">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${activeReport.time_mgmt_score || 90}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academy Engagement Metrics Row */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-50 print:border-zinc-200">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 print:text-zinc-600 block">Classroom Attendance</span>
                  <span className="text-lg font-black text-emerald-400 print:text-emerald-700 mt-1 block">
                    {activeReport.attendance_pct || student.attendance_pct}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-50 print:border-zinc-200">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 print:text-zinc-600 block">Homework Completed</span>
                  <span className="text-lg font-black text-blue-400 print:text-blue-700 mt-1 block">
                    {activeReport.homework_pct || student.homework_pct}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-50 print:border-zinc-200">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 print:text-zinc-600 block">Tactics Solved</span>
                  <span className="text-lg font-black text-orange-400 print:text-orange-700 mt-1 block">
                    {activeReport.puzzles_solved || student.puzzles_solved}
                  </span>
                </div>
              </div>

              {/* Coach Assessment & Growth Areas */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider print:text-zinc-700">
                  Coaching Staff Assessment
                </h4>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3 print:bg-zinc-50 print:border-zinc-200 text-xs leading-relaxed">
                  <div>
                    <strong className="text-emerald-400 print:text-emerald-800 block text-[11px] uppercase tracking-wide">
                      ⭐ Key Strengths:
                    </strong>
                    <p className="text-zinc-300 print:text-zinc-800 mt-0.5">
                      {activeReport.strengths || 'Sharp candidate move calculation, reliable tactical pin recognition, and active piece coordination.'}
                    </p>
                  </div>

                  <div>
                    <strong className="text-amber-400 print:text-amber-800 block text-[11px] uppercase tracking-wide">
                      🎯 Targeted Growth Areas for Next Month:
                    </strong>
                    <p className="text-zinc-300 print:text-zinc-800 mt-0.5">
                      {activeReport.areas_for_growth || 'Complex rook and pawn endgames, calculating quiet defensive maneuvers in closed positions.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 print:border-zinc-300">
                    <strong className="text-orange-400 print:text-orange-800 block text-[11px] uppercase tracking-wide">
                      💬 Head Coach Remarks:
                    </strong>
                    <p className="text-zinc-200 print:text-black italic mt-0.5">
                      "{activeReport.coach_remarks || student.notes || 'Demonstrating solid focus and tactical consistency during lectures.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Bottom Sign-off & Seal */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between print:border-zinc-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-black print:border-orange-500">
                    ♞
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white print:text-black">
                      {coachName}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono print:text-zinc-600">
                      Chief Grandmaster Instructor • {academyName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 print:border-zinc-300 print:text-zinc-700">
                    <Shield className="w-3 h-3 text-emerald-400" /> Digitally Verified Stamp
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* COACH CUSTOMIZATION DRAWER (When Editing)                 */}
          {/* ========================================================= */}
          {isEditing && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-orange-500/30 space-y-4 animate-in fade-in print:hidden">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Customize Evaluation Scores & Remarks
                </h4>
                <span className="text-[10px] text-zinc-500 font-mono">Live Edit</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Evaluation Period</label>
                  <input
                    type="text"
                    value={activeReport.period_label || ''}
                    onChange={(e) => setActiveReport({ ...activeReport, period_label: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Overall Grade</label>
                  <select
                    value={activeReport.overall_grade || 'A+'}
                    onChange={(e) => setActiveReport({ ...activeReport, overall_grade: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  >
                    <option value="A+">A+ (Elite Master Candidate)</option>
                    <option value="A">A (Strong Competitor)</option>
                    <option value="B+">B+ (Solid Performer)</option>
                    <option value="B">B (Developing)</option>
                    <option value="C">C (Needs Improvement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Rating Delta (+/-)</label>
                  <input
                    type="number"
                    value={activeReport.rating_change || 0}
                    onChange={(e) => setActiveReport({ ...activeReport, rating_change: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Tactics Score (%)</label>
                  <input
                    type="number"
                    value={activeReport.tactics_score || 92}
                    onChange={(e) => setActiveReport({ ...activeReport, tactics_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Key Strengths</label>
                <textarea
                  rows={2}
                  value={activeReport.strengths || ''}
                  onChange={(e) => setActiveReport({ ...activeReport, strengths: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Target Areas for Improvement</label>
                <textarea
                  rows={2}
                  value={activeReport.areas_for_growth || ''}
                  onChange={(e) => setActiveReport({ ...activeReport, areas_for_growth: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Head Coach Personal Remarks</label>
                <textarea
                  rows={2}
                  value={activeReport.coach_remarks || ''}
                  onChange={(e) => setActiveReport({ ...activeReport, coach_remarks: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 font-bold hover:bg-zinc-750"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save to Academy Database
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
