import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, X, CheckCircle2, AlertCircle, RefreshCw, 
  MessageCircle, Sparkles, Volume2, UserCheck, Search, Phone 
} from 'lucide-react';
import { attendanceService, CheckInResult, AttendanceStudent } from '../services/attendanceService';
import { useAuth } from '../services/authContext';

interface AttendanceScannerModalProps {
  batchId: string;
  batchName?: string;
  students: AttendanceStudent[];
  onClose: () => void;
  onCheckInSuccess: () => void;
}

export const AttendanceScannerModal: React.FC<AttendanceScannerModalProps> = ({
  batchId,
  batchName,
  students,
  onClose,
  onCheckInSuccess
}) => {
  const { token, user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInResult | null>(null);
  const [scanNotice, setScanNotice] = useState<string>('');
  const [manualQuery, setManualQuery] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Play crisp audio chime using Web Audio API (zero external assets needed)
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback allowed to fail silently
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCameraError('');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setCameraError('Camera access is not supported on this browser device.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera permission blocked or unavailable. You can use the instant student check-in keypad below.');
      setHasCamera(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  // Native BarcodeDetector loop if supported
  useEffect(() => {
    let animationFrameId: number;
    let isDetectorRunning = true;

    const setupDetector = async () => {
      if (!('BarcodeDetector' in window)) return;

      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

        const detectLoop = async () => {
          if (!isDetectorRunning) return;
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && isScanning) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0 && isScanning) {
                const rawValue = barcodes[0].rawValue;
                handleCodeDetected(rawValue);
              }
            } catch {
              // frame detection error
            }
          }
          animationFrameId = requestAnimationFrame(detectLoop);
        };

        detectLoop();
      } catch {
        // Fallback gracefully
      }
    };

    setupDetector();

    return () => {
      isDetectorRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning, token]);

  // Handle Processed QR Code Payload
  const handleCodeDetected = async (code: string) => {
    if (!token) return;
    setIsScanning(false);

    // Call check-in API
    const result = await attendanceService.checkIn(token, {
      qr_payload: code,
      batch_id: batchId,
      status: 'present',
      method: 'qr_scan'
    });

    if (result.status === 'success') {
      playSuccessChime();
      setLastCheckIn(result);
      setScanNotice(result.message);
      onCheckInSuccess();
    } else {
      setScanNotice(result.message || 'Invalid or unrecognized QR code');
    }

    // Auto-resume scanner after 3 seconds
    setTimeout(() => {
      setIsScanning(true);
    }, 3000);
  };

  // Manual 1-click Check-in
  const handleManualCheckIn = async (student: AttendanceStudent) => {
    if (!token) return;
    setIsScanning(false);

    const result = await attendanceService.checkIn(token, {
      student_id: student.student_id,
      batch_id: batchId,
      status: 'present',
      method: 'manual',
      notes: 'Checked in via coach scanner panel'
    });

    if (result.status === 'success') {
      playSuccessChime();
      setLastCheckIn(result);
      setScanNotice(`${student.name} marked Present!`);
      onCheckInSuccess();
    }

    setTimeout(() => {
      setIsScanning(true);
    }, 2500);
  };

  // 1-Click WhatsApp Parent Dispatch
  const handleSendWhatsAppNotification = () => {
    if (!lastCheckIn?.record) return;
    const rec = lastCheckIn.record;
    const parentPhone = (rec.parent_phone || '').replace(/[^0-9]/g, '');
    const message = lastCheckIn.whatsapp_message || `♟️ Student ${rec.student_name} has checked in for ${rec.batch_name || 'Chess Class'} at ${rec.formatted_time}.`;

    const encoded = encodeURIComponent(message);
    const targetUrl = parentPhone ? `https://wa.me/${parentPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(manualQuery.toLowerCase()) || 
    (s.fide_id && s.fide_id.toLowerCase().includes(manualQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Live Attendance QR Scanner</h3>
              <p className="text-[11px] text-zinc-400">Point camera at Student ID Card or scan phone screen</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-xs flex items-center gap-1"
              title="Flip camera"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner & Viewfinder Area */}
        <div className="p-6 overflow-y-auto space-y-5 bg-zinc-950/50">
          {/* Camera Viewfinder */}
          <div className="relative mx-auto max-w-sm w-full aspect-square bg-black rounded-3xl overflow-hidden border-2 border-orange-500/50 shadow-2xl flex items-center justify-center">
            {hasCamera ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="p-6 text-center text-xs text-zinc-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="font-semibold text-zinc-200">Camera Unavailable</p>
                <p className="text-[11px] text-zinc-500">{cameraError}</p>
              </div>
            )}

            {/* Target Scanning Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={`w-52 h-52 border-2 rounded-2xl transition-all duration-300 ${
                isScanning 
                  ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse' 
                  : 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.7)]'
              }`}>
                {/* Corner reticle marks */}
                <div className="w-4 h-4 border-t-2 border-l-2 border-white absolute -top-1 -left-1 rounded-tl"></div>
                <div className="w-4 h-4 border-t-2 border-r-2 border-white absolute -top-1 -right-1 rounded-tr"></div>
                <div className="w-4 h-4 border-b-2 border-l-2 border-white absolute -bottom-1 -left-1 rounded-bl"></div>
                <div className="w-4 h-4 border-b-2 border-r-2 border-white absolute -bottom-1 -right-1 rounded-br"></div>
              </div>
            </div>

            {/* Live scanning indicator badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-zinc-700/60 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-orange-500 animate-ping' : 'bg-emerald-400'}`}></span>
              <span>{isScanning ? 'ALIGN QR CODE' : 'CHECKED IN!'}</span>
            </div>
          </div>

          {/* Success Check-In Banner */}
          {lastCheckIn?.record && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                  {lastCheckIn.record.avatar_emoji || '✓'}
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    {lastCheckIn.record.student_name}
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                  </div>
                  <div className="text-[11px] text-emerald-300/80 font-mono mt-0.5">
                    Checked in at <strong>{lastCheckIn.record.formatted_time}</strong> • Batch: <strong>{lastCheckIn.record.batch_name || batchName || 'Alpha'}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendWhatsAppNotification}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify Parent</span>
              </button>
            </div>
          )}

          {/* Fallback / Instant 1-Click Roster Check-in */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-orange-400" />
                Quick Check-in Keypad (Click to Mark Present)
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {students.filter(s => s.status === 'present').length}/{students.length} Checked In
              </span>
            </div>

            {/* Quick search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Type student name to quickly check in..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Student Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredStudents.map((st) => {
                const isPresent = st.status === 'present';
                return (
                  <button
                    key={st.student_id}
                    onClick={() => handleManualCheckIn(st)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 group ${
                      isPresent
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 hover:border-orange-500/60 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{st.avatar_emoji || '👦'}</span>
                      <div className="truncate">
                        <div className="font-bold text-xs truncate">{st.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{st.checkin_time ? st.checkin_time.slice(0, 5) : 'Not in yet'}</div>
                      </div>
                    </div>
                    {isPresent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 group-hover:bg-orange-500 group-hover:text-white font-bold transition">
                        IN
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Camera automatically detects FIDE / Academy QR codes</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold transition text-xs"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};
