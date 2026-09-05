import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckSquare, FileText, Send, Plus, Search, 
  Filter, Sparkles, TrendingUp, Edit3, Trash2, X, AlertCircle, 
  RefreshCw, Award, MessageCircle, Phone, Mail, CheckCircle2, 
  Clock, Shield, ArrowRight, UserCheck, Layers, Printer,
  CreditCard, Check, DollarSign, Receipt, Download
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { userService, Student, Batch } from '../services/userService';
import { ReportCardModal } from '../components/ReportCardModal';
import { billingService, StudentFee, BillingMetrics } from '../services/billingService';
import { FeeInvoiceModal } from '../components/FeeInvoiceModal';

export const AcademyModule: React.FC = () => {
  const { user, token } = useAuth();
  const canManage = user?.role === 'saas_owner' || user?.role === 'academy_admin' || user?.role === 'head_coach';
  const isAdminOrOwner = user?.role === 'saas_owner' || user?.role === 'academy_admin';

  // Sub-Navigation Tab: 'students' | 'batches' | 'billing'
  const [activeTab, setActiveTab] = useState<'students' | 'batches' | 'billing'>('students');

  // Students & Batches State
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [coachesList, setCoachesList] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // Fee Ledger & Billing State
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [feeMetrics, setFeeMetrics] = useState<BillingMetrics | null>(null);
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('');
  const [feeSearchQuery, setFeeSearchQuery] = useState<string>('');
  const [feeBatchFilter, setFeeBatchFilter] = useState<string>('');
  const [isBillingLoading, setIsBillingLoading] = useState<boolean>(false);
  const [selectedFeeForInvoice, setSelectedFeeForInvoice] = useState<StudentFee | null>(null);
  const [recordingFee, setRecordingFee] = useState<StudentFee | null>(null);
  const [recordForm, setRecordForm] = useState({
    payment_method: 'upi',
    transaction_ref: '',
    notes: ''
  });
  const [feeActionSuccess, setFeeActionSuccess] = useState<string>('');

  // Student Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [whatsappSentNotice, setWhatsappSentNotice] = useState<boolean>(false);

  // Batch Modals state
  const [showAddBatchModal, setShowAddBatchModal] = useState<boolean>(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);

  // Student Add Form state & validation
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 1400,
    fide_id: '',
    batch_id: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    notes: '',
    avatar_emoji: '👦'
  });

  // Batch Add Form state & validation
  const [batchForm, setBatchForm] = useState({
    name: '',
    coach_id: '',
    schedule: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'master',
    max_students: 12
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [batchFormErrors, setBatchFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load students & batches from DB
  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    
    // Fetch students
    const stdData = await userService.getStudents(token, searchQuery, selectedBatchId);
    setStudents(stdData.students);

    // Fetch batches with coaches & capacity
    const batchData = await userService.getBatches(token);
    setBatches(batchData.batches);
    setCoachesList(batchData.coaches);

    if (stdData.students.length > 0 && !selectedStudent) {
      setSelectedStudent(stdData.students[0]);
    } else if (selectedStudent) {
      const refreshed = stdData.students.find(s => s.id === selectedStudent.id);
      if (refreshed) setSelectedStudent(refreshed);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token, selectedBatchId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load fee ledger & metrics
  const loadFeeData = async () => {
    if (!token) return;
    setIsBillingLoading(true);
    const res = await billingService.getFeeLedger(
      token,
      feeSearchQuery || undefined,
      feeBatchFilter || undefined,
      feeStatusFilter || undefined
    );
    if (res && res.fees) {
      setFees(res.fees);
      setFeeMetrics(res.metrics);
    }
    setIsBillingLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadFeeData();
    }
  }, [token, activeTab, feeStatusFilter, feeBatchFilter]);

  useEffect(() => {
    if (activeTab === 'billing') {
      const timer = setTimeout(() => {
        loadFeeData();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [feeSearchQuery]);

  // Form Validation - Student
  const validateStudentForm = () => {
    const errors: Record<string, string> = {};
    if (addForm.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }
    if (addForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      errors.email = 'Invalid email address';
    }
    if (addForm.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.parent_email.trim())) {
      errors.parent_email = 'Invalid parent email address';
    }
    if (addForm.rating < 100 || addForm.rating > 3500) {
      errors.rating = 'Rating must be between 100 and 3500';
    }
    if (addForm.parent_phone && addForm.parent_phone.replace(/[^0-9]/g, '').length < 7) {
      errors.parent_phone = 'Parent WhatsApp number must have at least 7 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Validation - Batch
  const validateBatchForm = () => {
    const errors: Record<string, string> = {};
    if (batchForm.name.trim().length < 2) {
      errors.name = 'Batch title must be at least 2 characters';
    }
    if (batchForm.schedule.trim().length < 3) {
      errors.schedule = 'Training schedule timing is required (e.g. Tue & Thu 6:00 PM IST)';
    }
    if (batchForm.max_students < 1 || batchForm.max_students > 50) {
      errors.max_students = 'Capacity must be between 1 and 50 students';
    }
    setBatchFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add Student
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateStudentForm() || !token) return;

    setIsSubmitting(true);
    const res = await userService.createStudent(token, addForm);
    setIsSubmitting(false);

    if (res.success) {
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        phone: '',
        rating: 1400,
        fide_id: '',
        batch_id: '',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        notes: '',
        avatar_emoji: '👦'
      });
      loadData();
    } else {
      setApiError(res.message);
    }
  };

  // Submit Edit Student
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !token) return;

    setIsSubmitting(true);
    const res = await userService.updateStudent(token, editingStudent);
    setIsSubmitting(false);

    if (res.success) {
      setEditingStudent(null);
      loadData();
    } else {
      setApiError(res.message);
    }
  };

  // Confirm Delete Student
  const handleDeleteConfirm = async () => {
    if (!deletingStudent || !token) return;

    setIsSubmitting(true);
    const res = await userService.deleteStudent(token, deletingStudent.id);
    setIsSubmitting(false);

    if (res.success) {
      if (selectedStudent?.id === deletingStudent.id) {
        setSelectedStudent(null);
      }
      setDeletingStudent(null);
      loadData();
    } else {
      alert(res.message);
    }
  };

  // Submit Add Batch
  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateBatchForm() || !token) return;

    setIsSubmitting(true);
    const res = await userService.createBatch(token, batchForm);
    setIsSubmitting(false);

    if (res.success) {
      setShowAddBatchModal(false);
      setBatchForm({
        name: '',
        coach_id: '',
        schedule: '',
        level: 'intermediate',
        max_students: 12
      });
      loadData();
    } else {
      setApiError(res.message);
    }
  };

  // Submit Edit Batch
  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !token) return;

    setIsSubmitting(true);
    const res = await userService.updateBatch(token, editingBatch);
    setIsSubmitting(false);

    if (res.success) {
      setEditingBatch(null);
      loadData();
    } else {
      setApiError(res.message);
    }
  };

  // Confirm Delete Batch
  const handleDeleteBatchConfirm = async () => {
    if (!deletingBatch || !token) return;

    setIsSubmitting(true);
    const res = await userService.deleteBatch(token, deletingBatch.id);
    setIsSubmitting(false);

    if (res.success) {
      setDeletingBatch(null);
      loadData();
    } else {
      alert(res.message);
    }
  };

  // 1-Click WhatsApp Parent Progress Dispatch
  const handleSendWhatsAppReport = (student: Student) => {
    const parentPhone = (student.parent_phone || '').replace(/[^0-9]/g, '');
    const academyName = user?.academyName || "Achiever's Chess Academy";
    
    const message = `🏆 *${academyName} — Monthly Student Progress Card* ♟️

Dear ${student.parent_name || 'Parent'},

Here is the latest chess performance summary for *${student.name}*:

• *Current Elo Rating:* ${student.rating}
• *Batch:* ${student.batch_name || 'Batch Alpha'}
• *Attendance:* ${student.attendance_pct}%
• *Tactical Puzzles Solved:* ${student.puzzles_solved}
• *Homework Score:* ${student.homework_pct}%

📝 *Coach Comments:*
"${student.notes || 'Demonstrating solid focus and tactical consistency during lectures.'}"

_Sent via Chess Play Academy Platform_`;

    const encoded = encodeURIComponent(message);
    const targetUrl = parentPhone ? `https://wa.me/${parentPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    window.open(targetUrl, '_blank');
    setWhatsappSentNotice(true);
    setTimeout(() => setWhatsappSentNotice(false), 4000);
  };

  // Submit Record Payment for Fee Ledger
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingFee || !token) return;
    setIsSubmitting(true);
    const res = await billingService.updatePayment(
      token,
      recordingFee.id,
      'paid',
      recordForm.payment_method,
      recordForm.transaction_ref,
      recordForm.notes
    );
    setIsSubmitting(false);

    if (res.success) {
      setRecordingFee(null);
      setRecordForm({ payment_method: 'upi', transaction_ref: '', notes: '' });
      setFeeActionSuccess(`Payment of ₹${recordingFee.amount.toLocaleString('en-IN')} recorded for ${recordingFee.student_name}!`);
      setTimeout(() => setFeeActionSuccess(''), 4000);
      loadFeeData();
    } else {
      alert(res.message || 'Failed to update payment');
    }
  };

  // 1-Click WhatsApp Fee Reminder or Payment Receipt
  const handleSendFeeWhatsApp = (fee: StudentFee) => {
    const parentPhone = (fee.parent_phone || '').replace(/[^0-9]/g, '');
    const academyName = user?.academyName || "Achiever's Chess Academy";
    const statusText = fee.status.toUpperCase();
    const upiId = "academy@upi";
    
    let message = '';
    if (fee.status === 'paid') {
      message = `🧾 *${academyName} — Fee Payment Receipt* ♟️\n\nDear ${fee.parent_name || 'Parent'},\n\nWe have received the monthly tuition fee for *${fee.student_name}* (${fee.billing_period}).\n\n• *Invoice No:* ${fee.invoice_number}\n• *Batch:* ${fee.batch_name || 'Batch Alpha'}\n• *Amount Paid:* ₹${fee.amount.toLocaleString('en-IN')}\n• *Payment Mode:* ${fee.payment_method?.toUpperCase() || 'UPI'}\n• *Transaction Ref:* ${fee.transaction_ref || 'Verified'}\n• *Status:* ✅ PAID\n\nOfficial printable GST receipt has been generated in your academy portal.\nThank you for choosing ${academyName}!\n\n_Sent via Chess Play Academy Platform_`;
    } else {
      message = `🔔 *${academyName} — Tuition Fee Reminder* ♟️\n\nDear ${fee.parent_name || 'Parent'},\n\nThis is a friendly reminder regarding the monthly tuition fee for *${fee.student_name}* for *${fee.billing_period}*.\n\n• *Invoice No:* ${fee.invoice_number}\n• *Batch:* ${fee.batch_name || 'Batch Alpha'}\n• *Amount Due:* ₹${fee.amount.toLocaleString('en-IN')}\n• *Due Date:* ${fee.due_date}\n• *Status:* ⚠️ ${statusText}\n• *Academy UPI:* ${upiId}\n\nPlease share the payment transaction ID or screenshot once transferred.\n\n_Sent via Chess Play Academy Platform_`;
    }

    const encoded = encodeURIComponent(message);
    const targetUrl = parentPhone ? `https://wa.me/${parentPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  // Derived metrics from real database records
  const activeCount = students.filter(s => s.status === 'active').length;
  const avgAttendance = students.length > 0 
    ? (students.reduce((acc, s) => acc + (s.attendance_pct || 90), 0) / students.length).toFixed(1)
    : '94.0';
  const avgHomework = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.homework_pct || 85), 0) / students.length).toFixed(1)
    : '89.0';
  const avgRating = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.rating || 1200), 0) / students.length)
    : 1530;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans animate-in fade-in">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Enrolled Students</span>
            <div className="text-3xl font-black text-white mt-1">{students.length}</div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> {activeCount} Active in Database
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-2xl border border-orange-500/30">
            ♟️
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Active Batches</span>
            <div className="text-3xl font-black text-white mt-1">{batches.length}</div>
            <span className="text-[11px] text-blue-400 font-semibold mt-0.5 block">
              Configured Schedules
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-2xl border border-blue-500/30">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Homework Done</span>
            <div className="text-3xl font-black text-white mt-1">{avgHomework}%</div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 block">
              1,240+ puzzles solved
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/30">
            📝
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Average Elo</span>
            <div className="text-3xl font-black text-white mt-1">{avgRating}</div>
            <span className="text-[11px] text-purple-400 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" /> FIDE Aligned
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-2xl border border-purple-500/30">
            🏆
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Roster</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'students' ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'batches'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Batches & Schedules</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'batches' ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {batches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fee Billing & Invoices</span>
            {feeMetrics && (
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'billing' ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {feeMetrics.paid_count}/{feeMetrics.total_invoices} Paid
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadData();
              loadFeeData();
            }}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Refresh Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {activeTab === 'students' && canManage && (
            <button
              onClick={() => {
                setApiError('');
                setFormErrors({});
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          )}

          {activeTab === 'batches' && canManage && (
            <button
              onClick={() => {
                setApiError('');
                setBatchFormErrors({});
                setShowAddBatchModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition"
            >
              <Plus className="w-4 h-4" /> Create New Batch
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. STUDENT ROSTER TAB                                     */}
      {/* ========================================================= */}
      {activeTab === 'students' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          {/* Student List Column (Col 7) */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-black text-white">Student Roster & Profiles</h3>
                <p className="text-xs text-zinc-400">Live MySQL records for student progression, ratings & parent contacts</p>
              </div>
            </div>

            {/* Search & Batch Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students or parent names..."
                  className="w-full pl-10 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Student List Items */}
            {isLoading ? (
              <div className="py-12 text-center text-xs font-mono text-zinc-500">
                Loading student records...
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No students found. Click "Add Student" to register a new student.
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {students.map((st) => {
                  const isSelected = selectedStudent?.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStudent(st)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 group ${
                        isSelected
                          ? 'bg-zinc-800/90 border-orange-500/50 shadow-md ring-1 ring-orange-500/20'
                          : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                          {st.avatar_emoji || '👦'}
                        </span>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white group-hover:text-orange-400 transition truncate">
                              {st.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-400 border border-orange-500/20">
                              {st.rating}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {st.batch_name || 'Batch Alpha'} • Parent: <strong className="text-zinc-400">{st.parent_name || 'N/A'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-black text-emerald-400">{st.attendance_pct}%</span>
                          <span className="text-[10px] text-zinc-500 block uppercase">Attendance</span>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(st);
                                setReportCardStudent(st);
                              }}
                              className="p-1.5 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition"
                              title="Official Performance Report Card"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStudent(st);
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                              title="Edit student"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingStudent(st);
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Student Detail Card & Parent WhatsApp Dispatch (Col 5) */}
          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5 sticky top-24">
            {selectedStudent ? (
              <>
                {/* Profile Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
                      {selectedStudent.avatar_emoji || '👦'}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">{selectedStudent.name}</h3>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        FIDE: {selectedStudent.fide_id || 'Unrated'} • Rating: <strong className="text-orange-400">{selectedStudent.rating}</strong>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedStudent.status}
                  </span>
                </div>

                {/* Progress Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Attendance</span>
                    <span className="text-base font-black text-emerald-400 mt-1 block">{selectedStudent.attendance_pct}%</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Puzzles</span>
                    <span className="text-base font-black text-orange-400 mt-1 block">{selectedStudent.puzzles_solved}</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Homework</span>
                    <span className="text-base font-black text-blue-400 mt-1 block">{selectedStudent.homework_pct}%</span>
                  </div>
                </div>

                {/* Batch & Parent Contact Information */}
                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Enrolled Batch:</span>
                    <strong className="text-zinc-200">{selectedStudent.batch_name || 'Batch Alpha'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Parent / Guardian:</span>
                    <strong className="text-zinc-200">{selectedStudent.parent_name || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Parent WhatsApp:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedStudent.parent_phone || '—'}</span>
                  </div>
                </div>

                {/* Coach Evaluation Notes */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 block">Coach Tactical Notes</span>
                  <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 italic leading-relaxed">
                    "{selectedStudent.notes || 'Consistent progress in middle game play. Working on rook endgames.'}"
                  </p>
                </div>

                {/* Report Card & WhatsApp Dispatch */}
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <button
                    onClick={() => setReportCardStudent(selectedStudent)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    <Printer className="w-4 h-4" /> Official Report Card (Print & PDF)
                  </button>

                  <button
                    onClick={() => handleSendWhatsAppReport(selectedStudent)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-4 h-4" /> Quick WhatsApp Progress Dispatch
                  </button>

                  {whatsappSentNotice && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> WhatsApp Web / App opened with formatted card!
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-zinc-500">
                Select a student to view their detailed performance and send parent progress cards.
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'batches' ? (
        /* ========================================================= */
        /* 2. BATCHES & SCHEDULES TAB                                */
        /* ========================================================= */
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Training Batches & Weekly Schedules
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure rating tiers, assign head instructors, schedule live timings, and monitor student seat capacity.
              </p>
            </div>

            <div className="text-xs text-zinc-400 font-mono flex items-center gap-3">
              <span>Total Batches: <strong className="text-white">{batches.length}</strong></span>
              <span>•</span>
              <span>Total Enrolled: <strong className="text-orange-400">{students.length} Students</strong></span>
            </div>
          </div>

          {/* Batches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch) => {
              const enrolled = batch.enrolled_count || 0;
              const maxSeats = batch.max_students || 12;
              const percentFilled = Math.min(100, Math.round((enrolled / maxSeats) * 100));

              return (
                <div
                  key={batch.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-4 transition group"
                >
                  <div className="space-y-3.5">
                    {/* Level Badge & Header */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        batch.level === 'master' 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : batch.level === 'advanced'
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : batch.level === 'intermediate'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {batch.level}
                      </span>

                      {isAdminOrOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingBatch(batch)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                            title="Edit batch"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingBatch(batch)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-white group-hover:text-orange-400 transition">
                        {batch.name}
                      </h4>
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{batch.schedule}</span>
                      </div>
                    </div>

                    {/* Assigned Coach Tile */}
                    <div className="bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-2xl flex items-center gap-2.5">
                      <span className="text-xl p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                        {batch.coach_avatar || '👨‍🏫'}
                      </span>
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Instructor</span>
                        <span className="text-xs font-bold text-zinc-200 truncate block">
                          {batch.coach_name || 'Assigned Faculty'}
                        </span>
                      </div>
                    </div>

                    {/* Seat Capacity Progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Classroom Capacity</span>
                        <span className="font-mono font-bold text-white">
                          {enrolled} / {maxSeats} Seats ({percentFilled}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Action: View Roster for this batch */}
                  <div className="pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setActiveTab('students');
                      }}
                      className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition group-hover:border-orange-500/40"
                    >
                      <span>View Batch Roster ({enrolled})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 3. FEE BILLING & INVOICES TAB                             */
        /* ========================================================= */
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Overview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                Academy Student Fee Billing & Automated Invoicing
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Track batch-wise tuition fees, generate official printable GST receipts, record offline/online payments, and send instant WhatsApp reminders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono">
                Billing Cycle: <strong className="text-white">September 2026</strong>
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {feeActionSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{feeActionSuccess}</span>
            </div>
          )}

          {/* Detailed Financial Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Total Invoiced</span>
                <div className="text-2xl font-black text-white mt-1">
                  ₹{feeMetrics ? feeMetrics.total_billed.toLocaleString('en-IN') : '21,000'}
                </div>
                <span className="text-[11px] text-zinc-400 font-semibold mt-0.5 block">
                  {feeMetrics ? feeMetrics.total_invoices : 6} Invoices for Sep 2026
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xl border border-zinc-700">
                ₹
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Total Collected</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{feeMetrics ? feeMetrics.total_collected.toLocaleString('en-IN') : '14,000'}
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 block">
                  {feeMetrics ? feeMetrics.paid_count : 4} of {feeMetrics ? feeMetrics.total_invoices : 6} Paid ({feeMetrics ? feeMetrics.collection_rate : '66.7'}%)
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">
                ✓
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">Pending Collection</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  ₹{feeMetrics ? feeMetrics.total_pending.toLocaleString('en-IN') : '7,000'}
                </div>
                <span className="text-[11px] text-amber-400 font-semibold mt-0.5 block">
                  {feeMetrics ? feeMetrics.pending_count : 1} Awaiting payment
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
                ⏳
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-rose-500/30 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider font-mono">Overdue Fees</span>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  ₹{feeMetrics ? (feeMetrics.overdue_count * 3500).toLocaleString('en-IN') : '3,500'}
                </div>
                <span className="text-[11px] text-rose-400 font-semibold mt-0.5 block">
                  {feeMetrics ? feeMetrics.overdue_count : 1} Follow-up required
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xl border border-rose-500/30">
                ⚠️
              </div>
            </div>
          </div>

          {/* Ledger Table Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={feeSearchQuery}
                    onChange={(e) => setFeeSearchQuery(e.target.value)}
                    placeholder="Search invoice #, student or parent..."
                    className="w-full pl-10 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Batch Filter */}
                <select
                  value={feeBatchFilter}
                  onChange={(e) => setFeeBatchFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  {(['', 'paid', 'pending', 'overdue'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFeeStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                        feeStatusFilter === st
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st === '' ? 'All Status' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-zinc-400 font-mono">
                Showing <strong className="text-white">{fees.length}</strong> records
              </div>
            </div>

            {/* Invoices Ledger Table */}
            {isBillingLoading ? (
              <div className="py-16 text-center text-xs font-mono text-zinc-500">
                Loading fee records & invoices...
              </div>
            ) : fees.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500">
                No fee records found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-3">Invoice No & Month</th>
                      <th className="py-3 px-3">Student & Batch</th>
                      <th className="py-3 px-3">Parent Details</th>
                      <th className="py-3 px-3 text-right">Fee (₹)</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Payment Info</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {fees.map((fee) => {
                      const isPaid = fee.status === 'paid';
                      const isOverdue = fee.status === 'overdue';

                      return (
                        <tr key={fee.id} className="hover:bg-zinc-950/40 transition group">
                          {/* Invoice # & Period */}
                          <td className="py-3.5 px-3">
                            <div className="font-mono font-bold text-white group-hover:text-orange-400 transition">
                              {fee.invoice_number}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              {fee.billing_period}
                            </div>
                          </td>

                          {/* Student & Batch */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{fee.avatar_emoji || '♟️'}</span>
                              <div>
                                <div className="font-bold text-zinc-100">{fee.student_name}</div>
                                <div className="text-[11px] text-zinc-400">{fee.batch_name || 'Batch Alpha'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Parent Details */}
                          <td className="py-3.5 px-3">
                            <div className="text-zinc-300 font-semibold">{fee.parent_name || 'Guardian'}</div>
                            <div className="text-[11px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-500" />
                              {fee.parent_phone || '—'}
                            </div>
                          </td>

                          {/* Fee Amount */}
                          <td className="py-3.5 px-3 text-right">
                            <span className="text-sm font-mono font-black text-white">
                              ₹{fee.amount.toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Due Date */}
                          <td className="py-3.5 px-3">
                            <span className={`font-mono text-[11px] ${isOverdue ? 'text-rose-400 font-bold' : 'text-zinc-300'}`}>
                              {fee.due_date}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize border ${
                              isPaid
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : isOverdue
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                              {isPaid ? <CheckCircle2 className="w-3 h-3" /> : isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {fee.status}
                            </span>
                          </td>

                          {/* Payment Info */}
                          <td className="py-3.5 px-3">
                            {isPaid ? (
                              <div className="text-[11px]">
                                <span className="font-semibold text-zinc-300 uppercase">{fee.payment_method || 'UPI'}</span>
                                {fee.transaction_ref && (
                                  <div className="text-[10px] font-mono text-zinc-400 truncate max-w-[120px]" title={fee.transaction_ref}>
                                    Ref: {fee.transaction_ref}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono italic">Awaiting</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View / Print Official Tax Invoice */}
                              <button
                                onClick={() => setSelectedFeeForInvoice(fee)}
                                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] flex items-center gap-1.5 transition border border-zinc-700/60 hover:border-orange-500/50"
                                title="View & Print Official GST Invoice"
                              >
                                <Printer className="w-3.5 h-3.5 text-orange-400" />
                                <span>Invoice</span>
                              </button>

                              {/* Record Payment (if not already paid) */}
                              {!isPaid && canManage && (
                                <button
                                  onClick={() => {
                                    setRecordingFee(fee);
                                    setRecordForm({ payment_method: 'upi', transaction_ref: '', notes: '' });
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm"
                                  title="Record Payment"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay</span>
                                </button>
                              )}

                              {/* 1-Click WhatsApp Reminder / Receipt */}
                              <button
                                onClick={() => handleSendFeeWhatsApp(fee)}
                                className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition border border-emerald-500/30"
                                title={isPaid ? "Send Receipt via WhatsApp" : "Send Fee Reminder via WhatsApp"}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Add Student Modal                                         */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Enroll New Student</h3>
                <p className="text-xs text-zinc-400">Stores permanent student & parent contact record in database</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {apiError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  {formErrors.name && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.name}</span>}
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Starting Rating (Elo) *</label>
                  <input
                    type="number"
                    required
                    value={addForm.rating}
                    onChange={(e) => setAddForm({ ...addForm, rating: parseInt(e.target.value) || 1200 })}
                    placeholder="1200"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  {formErrors.rating && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.rating}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Batch Assignment</label>
                  <select
                    value={addForm.batch_id}
                    onChange={(e) => setAddForm({ ...addForm, batch_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">FIDE ID (Optional)</label>
                  <input
                    type="text"
                    value={addForm.fide_id}
                    onChange={(e) => setAddForm({ ...addForm, fide_id: e.target.value })}
                    placeholder="FIDE-IND-12345"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Parent Full Name</label>
                  <input
                    type="text"
                    value={addForm.parent_name}
                    onChange={(e) => setAddForm({ ...addForm, parent_name: e.target.value })}
                    placeholder="e.g. Suresh Sharma"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Parent WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={addForm.parent_phone}
                    onChange={(e) => setAddForm({ ...addForm, parent_phone: e.target.value })}
                    placeholder="+91 98123 45670"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  {formErrors.parent_phone && <span className="text-rose-400 text-[11px] mt-0.5 block">{formErrors.parent_phone}</span>}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Coach Notes / Initial Assessment</label>
                <textarea
                  rows={2}
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Focus areas, openings studied, tactical strengths..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Create Batch Modal                                        */}
      {/* ========================================================= */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Create New Academy Batch</h3>
                <p className="text-xs text-zinc-400">Configures training tier, schedule and instructor</p>
              </div>
              <button onClick={() => setShowAddBatchModal(false)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {apiError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleAddBatchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  placeholder="e.g. Master Champions (1800+)"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
                {batchFormErrors.name && <span className="text-rose-400 text-[11px] mt-0.5 block">{batchFormErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Skill Tier *</label>
                  <select
                    value={batchForm.level}
                    onChange={(e) => setBatchForm({ ...batchForm, level: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="beginner">Beginner (800 - 1200)</option>
                    <option value="intermediate">Intermediate (1200 - 1600)</option>
                    <option value="advanced">Advanced (1600 - 2000)</option>
                    <option value="master">Master (2000+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Max Student Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={batchForm.max_students}
                    onChange={(e) => setBatchForm({ ...batchForm, max_students: parseInt(e.target.value) || 12 })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                  {batchFormErrors.max_students && <span className="text-rose-400 text-[11px] mt-0.5 block">{batchFormErrors.max_students}</span>}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Assigned Coach / Instructor</label>
                <select
                  value={batchForm.coach_id}
                  onChange={(e) => setBatchForm({ ...batchForm, coach_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select Instructor...</option>
                  {coachesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.fide_title || c.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Weekly Training Schedule *</label>
                <input
                  type="text"
                  required
                  value={batchForm.schedule}
                  onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })}
                  placeholder="e.g. Mon, Wed, Fri 5:00 PM IST"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
                {batchFormErrors.schedule && <span className="text-rose-400 text-[11px] mt-0.5 block">{batchFormErrors.schedule}</span>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Edit Batch Modal                                          */}
      {/* ========================================================= */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Edit Batch: {editingBatch.name}</h3>
                <p className="text-xs text-zinc-400">Update instructor, schedule or capacity</p>
              </div>
              <button onClick={() => setEditingBatch(null)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBatchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Batch Name</label>
                <input
                  type="text"
                  value={editingBatch.name}
                  onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Skill Tier</label>
                  <select
                    value={editingBatch.level}
                    onChange={(e) => setEditingBatch({ ...editingBatch, level: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="master">Master</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={editingBatch.max_students}
                    onChange={(e) => setEditingBatch({ ...editingBatch, max_students: parseInt(e.target.value) || 12 })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Instructor</label>
                <select
                  value={editingBatch.coach_id || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, coach_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select Instructor...</option>
                  {coachesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Schedule Timing</label>
                <input
                  type="text"
                  value={editingBatch.schedule}
                  onChange={(e) => setEditingBatch({ ...editingBatch, schedule: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Batch Modal                                        */}
      {/* ========================================================= */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Delete Batch?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to remove <strong className="text-zinc-200">{deletingBatch.name}</strong>? Any enrolled students will be unlinked and remain in the general roster.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingBatch(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBatchConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Edit Student: {editingStudent.name}</h3>
                <p className="text-xs text-zinc-400">Update Elo rating, batch, and tactical notes</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Elo Rating</label>
                  <input
                    type="number"
                    value={editingStudent.rating}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rating: parseInt(e.target.value) || 1200 })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Batch</label>
                  <select
                    value={editingStudent.batch_id || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, batch_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Parent WhatsApp</label>
                  <input
                    type="text"
                    value={editingStudent.parent_phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parent_phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Coach Notes</label>
                <textarea
                  rows={3}
                  value={editingStudent.notes || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-black text-white">Discharge Student?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to remove <strong className="text-zinc-200">{deletingStudent.name}</strong> from the database? All homework records and progress metrics will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20"
              >
                {isSubmitting ? 'Discharging...' : 'Discharge Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Student Performance Report Card Modal */}
      {reportCardStudent && (
        <ReportCardModal
          isOpen={!!reportCardStudent}
          onClose={() => setReportCardStudent(null)}
          student={reportCardStudent}
          onReportSaved={loadData}
        />
      )}

      {/* Record Payment Modal */}
      {recordingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-400" />
                  Record Fee Payment
                </h3>
                <p className="text-xs text-zinc-400">{recordingFee.student_name} • {recordingFee.invoice_number}</p>
              </div>
              <button onClick={() => setRecordingFee(null)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-zinc-400 text-[11px]">Due Amount</div>
                  <div className="text-xl font-mono font-black text-white">₹{recordingFee.amount.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-400 text-[11px]">Period</div>
                  <div className="text-xs font-semibold text-orange-400">{recordingFee.billing_period}</div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Payment Method *</label>
                <select
                  value={recordForm.payment_method}
                  onChange={(e) => setRecordForm({ ...recordForm, payment_method: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm / QR)</option>
                  <option value="netbanking">Net Banking / NEFT / IMPS</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Transaction Ref / UTR No.</label>
                <input
                  type="text"
                  value={recordForm.transaction_ref}
                  onChange={(e) => setRecordForm({ ...recordForm, transaction_ref: e.target.value })}
                  placeholder="e.g. UPI/9842109 or NEFT48329"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Remarks / Note (Optional)</label>
                <textarea
                  rows={2}
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="e.g. Received via GPay from student father"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRecordingFee(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold transition shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Recording...' : 'Mark as Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Tax Invoice & GST Receipt Modal */}
      {selectedFeeForInvoice && (
        <FeeInvoiceModal
          fee={selectedFeeForInvoice}
          onClose={() => setSelectedFeeForInvoice(null)}
        />
      )}
    </div>
  );
};
