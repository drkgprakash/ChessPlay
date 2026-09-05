import React, { useRef } from 'react';
import { 
  X, Printer, Download, Share2, ShieldCheck, 
  QrCode, User, Phone, Award, Calendar, CheckCircle2, MessageCircle 
} from 'lucide-react';
import { Student } from '../services/userService';
import { useAuth } from '../services/authContext';

interface StudentIDCardModalProps {
  student: Student | any;
  onClose: () => void;
}

export const StudentIDCardModal: React.FC<StudentIDCardModalProps> = ({ student, onClose }) => {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const academyName = user?.academyName || "Achiever's Chess Academy";
  const rollNumber = student.id ? `CHESS-${student.id.toUpperCase()}` : 'CHESS-ST-001';
  const qrPayload = `CHESSPLAY:ATTENDANCE:${student.id || 'st-1'}:${student.academy_id || 'acad-001'}:${student.batch_id || 'batch-01'}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(qrPayload)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const parentPhone = (student.parent_phone || '').replace(/[^0-9]/g, '');
    const message = `🏆 *${academyName} — Official Student Digital ID Card* ♟️\n\n`
      + `Dear ${student.parent_name || 'Parent'},\n\n`
      + `Here is the digital attendance check-in card for *${student.name}*:\n\n`
      + `• *Student Roll No:* ${rollNumber}\n`
      + `• *Current Rating:* ${student.rating || 1400} Elo\n`
      + `• *Batch:* ${student.batch_name || 'Batch Alpha'}\n`
      + `• *FIDE ID:* ${student.fide_id || 'Registered'}\n\n`
      + `📲 *Check-In Instructions:*\n`
      + `Please show this card or save the QR code on your phone for rapid automated check-in when arriving for training sessions.\n\n`
      + `_Powered by Chess Play Academy Platform_`;

    const encoded = encodeURIComponent(message);
    const targetUrl = parentPhone ? `https://wa.me/${parentPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              ♟️
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Student Digital ID & QR Pass</h3>
              <p className="text-[11px] text-zinc-400">Official academy pass for contactless class check-in</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition border border-zinc-700"
              title="Print Badge"
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" />
              <span>Print Badge</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition border border-emerald-500/30"
              title="Send to Parent WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body Container */}
        <div className="p-6 overflow-y-auto flex flex-col items-center justify-center bg-zinc-950/40">
          {/* Printable Physical ID Card Simulation */}
          <div 
            ref={cardRef}
            id="printable-id-card"
            className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-orange-500/40 shadow-2xl p-6 text-white relative overflow-hidden flex flex-col items-center text-center space-y-4 font-sans"
          >
            {/* Background luxury watermark pattern */}
            <div className="absolute -right-8 -top-8 text-9xl opacity-5 select-none pointer-events-none font-serif">
              ♞
            </div>

            {/* Academy Top Header */}
            <div className="w-full pb-3 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-lg shadow-sm">
                  ♞
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-tight text-zinc-100">{academyName}</div>
                  <div className="text-[9px] text-zinc-400 font-mono">FIDE Certified Training Center</div>
                </div>
              </div>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
                Student Pass
              </span>
            </div>

            {/* Student Avatar & Basic Info */}
            <div className="space-y-1 pt-1">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-zinc-800/80 border-2 border-orange-500/40 flex items-center justify-center text-4xl shadow-inner">
                {student.avatar_emoji || '👦'}
              </div>
              <h2 className="text-lg font-black tracking-tight text-white pt-2">
                {student.name}
              </h2>
              <div className="text-xs text-orange-400 font-bold font-mono flex items-center justify-center gap-2">
                <span>Elo: {student.rating || 1400}</span>
                <span>•</span>
                <span>{student.batch_name || 'Batch Alpha'}</span>
              </div>
            </div>

            {/* High Contrast QR Code for Live Scanning */}
            <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-zinc-200">
              <img 
                src={qrCodeUrl} 
                alt={`Attendance QR for ${student.name}`}
                className="w-44 h-44 object-contain rounded-lg"
              />
              <div className="text-[10px] font-mono text-zinc-800 font-bold mt-1">
                SCAN FOR CHECK-IN
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="w-full grid grid-cols-2 gap-2 text-left text-[11px] bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800/80 font-mono">
              <div>
                <span className="text-zinc-500 text-[10px] block">ROLL NUMBER</span>
                <strong className="text-zinc-200">{rollNumber}</strong>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">FIDE ID</span>
                <strong className="text-zinc-200">{student.fide_id || 'IND-2026-FIDE'}</strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">PARENT / EMERGENCY CONTACT</span>
                <strong className="text-zinc-200">{student.parent_name || 'Guardian'} ({student.parent_phone || '—'})</strong>
              </div>
            </div>

            {/* Footer Verification Badge */}
            <div className="w-full pt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Badge
              </span>
              <span>Valid: 2026-2027</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Tip */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Students scan this QR code on arrival using the coach scanner camera</span>
          </div>
          <button
            onClick={handleSendWhatsApp}
            className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            Send WhatsApp Pass →
          </button>
        </div>
      </div>
    </div>
  );
};
