import React, { useRef } from 'react';
import { 
  X, Printer, Download, MessageSquare, CheckCircle2, 
  AlertTriangle, Clock, Building2, QrCode, ShieldCheck, 
  CreditCard, Send, Sparkles 
} from 'lucide-react';
import { StudentFee } from '../services/billingService';

interface FeeInvoiceModalProps {
  fee: StudentFee;
  academyName?: string;
  onClose: () => void;
}

export const FeeInvoiceModal: React.FC<FeeInvoiceModalProps> = ({
  fee,
  academyName = "Achiever's Chess Academy",
  onClose
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const parentPhone = (fee.parent_phone || '').replace(/[^0-9]/g, '');
    const isPaid = fee.status === 'paid';
    
    let message = '';
    if (isPaid) {
      message = `🧾 *Official Fee Receipt — ${academyName}* ♟️

Dear ${fee.parent_name || 'Parent'},

We gratefully acknowledge receipt of the monthly coaching fee for *${fee.student_name}*:

• *Invoice No:* ${fee.invoice_number}
• *Billing Period:* ${fee.billing_period}
• *Amount Paid:* ₹${Number(fee.total_amount).toLocaleString('en-IN')}
• *Payment Mode:* ${fee.payment_method?.toUpperCase() || 'UPI'}
• *Transaction Ref / UTR:* ${fee.transaction_ref || 'CONFIRMED'}
• *Status:* PAID & SETTLED ✓

Thank you for your continuous dedication to ${fee.student_name}'s chess journey!

_Chess Play Academy OS • Verification ID: ${fee.id}_`;
    } else {
      message = `🔔 *Fee Reminder Notice — ${academyName}* ♟️

Dear ${fee.parent_name || 'Parent'},

This is a friendly reminder regarding the monthly coaching tuition for *${fee.student_name}*:

• *Invoice No:* ${fee.invoice_number}
• *Billing Period:* ${fee.billing_period}
• *Total Due:* ₹${Number(fee.total_amount).toLocaleString('en-IN')}
• *Due Date:* ${fee.due_date}
• *Status:* ${fee.status.toUpperCase()}

📲 *Easy UPI Payment:*
• *UPI ID (VPA):* achieverschess@icici
• *Payee:* ${academyName}

Kindly share the transaction screenshot or UTR number once paid. Thank you!

_Chess Play Academy OS_`;
    }

    const encoded = encodeURIComponent(message);
    const targetUrl = parentPhone ? `https://wa.me/${parentPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  const isPaid = fee.status === 'paid';
  const isOverdue = fee.status === 'overdue';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Print Stylesheet overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #09090b !important;
            box-shadow: none !important;
            border: none !important;
            padding: 24px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Modal Actions Bar (No Print) */}
        <div className="no-print px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-orange-400" /> Official Tax Invoice & Receipt
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isPaid 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isOverdue 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {fee.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold transition flex items-center gap-1.5"
              title="Dispatch to parent WhatsApp"
            >
              <Send className="w-3.5 h-3.5" /> WhatsApp {isPaid ? 'Receipt' : 'Reminder'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-zinc-950/60">
          <div 
            id="printable-invoice"
            ref={invoiceRef}
            className="bg-white text-zinc-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-200 font-sans flex flex-col gap-6"
          >
            {/* 1. Official Academy Crest & Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-3xl font-black shadow-md">
                  ♞
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                    {academyName}
                  </h1>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    FIDE Affiliated Professional Chess Academy • Karnataka State
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    GSTIN: 29AAACA1234B1Z5 • Reg: IND-FIDE-0892
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">
                  {isPaid ? 'TAX INVOICE & RECEIPT' : 'FEE DEMAND INVOICE'}
                </span>
                <span className="text-base font-black text-orange-600 font-mono block mt-0.5">
                  #{fee.invoice_number}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium mt-1 block">
                  Date: {fee.paid_date ? fee.paid_date.split(' ')[0] : fee.due_date}
                </span>
              </div>
            </div>

            {/* 2. Bill To & Period Info Grid */}
            <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                  Billed To (Student & Parent):
                </span>
                <div className="font-extrabold text-sm text-zinc-900">
                  {fee.student_name}
                </div>
                {fee.fide_id && (
                  <div className="text-[11px] font-mono text-zinc-600 mt-0.5">
                    FIDE ID: {fee.fide_id} • Rating: {fee.rating || '1400+'}
                  </div>
                )}
                <div className="text-[11px] text-zinc-600 mt-1">
                  Parent: <strong>{fee.parent_name || 'Guardian'}</strong>
                </div>
                {fee.parent_phone && (
                  <div className="text-[11px] font-mono text-zinc-500">
                    Phone: {fee.parent_phone}
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                  Coaching Details:
                </span>
                <div className="font-bold text-zinc-900">
                  {fee.batch_name || 'Batch Alpha (1400-1800)'}
                </div>
                <div className="text-[11px] text-zinc-600 mt-0.5">
                  Billing Period: <strong className="text-zinc-900">{fee.billing_period}</strong>
                </div>
                <div className="text-[11px] text-zinc-600 mt-0.5">
                  Due Date: <strong className="font-mono">{fee.due_date}</strong>
                </div>
              </div>
            </div>

            {/* 3. Itemized Coaching Fee Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-600 font-bold border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Course / Coaching Description</th>
                    <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-right">Tuition Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  <tr>
                    <td className="py-3 px-3 font-mono text-zinc-500">1</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-900">Monthly Grandmaster Curriculum Tuition</div>
                      <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                        Batch Alpha masterclass sessions, 2-way live board sync, Stockfish AI homework drills, 6-board simul analysis, and Swiss tournament participation.
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-500">999293</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      ₹{Number(fee.amount).toLocaleString('en-IN')}.00
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals Calculation */}
              <div className="bg-zinc-50/80 p-4 border-t border-zinc-200 flex flex-col items-end gap-1 text-xs">
                <div className="flex justify-between w-48 text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">₹{Number(fee.amount).toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between w-48 text-zinc-600">
                  <span>Discounts / Concessions:</span>
                  <span className="font-mono font-semibold">- ₹{Number(fee.discount || 0).toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between w-48 text-zinc-600">
                  <span>GST / Tax:</span>
                  <span className="font-mono font-semibold">₹0.00 (Exempt)</span>
                </div>
                <div className="flex justify-between w-48 pt-2 border-t border-zinc-200 text-sm font-black text-zinc-950">
                  <span>Total Amount:</span>
                  <span className="font-mono text-orange-600">₹{Number(fee.total_amount).toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            {/* 4. Payment Settlement / QR Box */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
              isPaid 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  isPaid ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isPaid ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    {isPaid ? 'Payment Confirmed & Settled' : 'Payment Awaited'}
                  </div>
                  <div className="text-[11px] font-mono mt-0.5">
                    {isPaid ? (
                      <>Mode: <strong className="uppercase">{fee.payment_method || 'UPI'}</strong> • Ref: <strong>{fee.transaction_ref || 'CONFIRMED'}</strong></>
                    ) : (
                      <>Due by: <strong>{fee.due_date}</strong> • Outstanding: <strong>₹{Number(fee.total_amount).toLocaleString('en-IN')}</strong></>
                    )}
                  </div>
                </div>
              </div>

              {!isPaid && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-300">
                  <QrCode className="w-5 h-5 text-amber-600" />
                  <div className="text-left text-[10px]">
                    <div className="font-bold text-zinc-900">UPI ID (VPA):</div>
                    <div className="font-mono text-amber-700 font-bold">achieverschess@icici</div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Authorization & Digital Stamp */}
            <div className="flex items-end justify-between pt-4 border-t border-zinc-200 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Academy Digital Receipt
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Generated via Chess Play Academy Operating System
                </div>
                <div className="text-[9px] text-zinc-400 font-mono">
                  Doc Ref: {fee.id} • Timestamp: {new Date().toISOString()}
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="w-32 border-b border-zinc-400 mx-auto pb-6">
                  <span className="font-serif italic text-zinc-500 text-sm">Rajesh Kumar</span>
                </div>
                <div className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider">
                  Authorized Signatory
                </div>
                <div className="text-[9px] text-zinc-500">Academy Accounts Office</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (No Print) */}
        <div className="no-print px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono text-[11px]">
            Ready for physical printing or Save as PDF (Ctrl+P / Cmd+P)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
