import React, { useState } from 'react';
import { Mail, Phone, Calendar, Clock, Send, CheckCircle2, Building, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    academyName: '',
    studentCount: '25-100',
    preferredTime: 'Morning (10:00 AM - 1:00 PM)',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Personalized Walkthrough</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
          Book a Free Demo for Your Academy
        </h1>
        <p className="text-zinc-400 text-base mt-4 leading-relaxed">
          See how <strong>Chess Play</strong> can streamline your classes, delight parents, and help you grow your student base. We’ll tailor the demo to your academy’s exact curriculum.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-5xl mx-auto">
        {/* Left: Contact Info & Benefits (Col 5) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">What you’ll see in the demo:</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A 20-minute tailored tour with a chess technology specialist:
            </p>
          </div>

          <ul className="space-y-4 text-xs text-zinc-300 font-medium">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Live Classroom & Simul Grid:</strong> How to monitor multiple student games simultaneously.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Stockfish 16 AI Coach:</strong> How plain-English blunder explanations accelerate student learning.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>WhatsApp Report Automation:</strong> Preview how parent progress reports look and send.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span><strong>Custom Migration:</strong> We’ll help you import all your students from spreadsheets for free.</span>
            </li>
          </ul>

          <div className="pt-6 border-t border-zinc-800 space-y-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-400" />
              <span>support@chessplay.in</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-orange-400" />
              <span>Domain: chessplay.in | App: app.chessplay.in</span>
            </div>
          </div>
        </div>

        {/* Right: Booking Form (Col 7) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center gap-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-white">Demo Requested!</h3>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Our academy specialist will email you the calendar invite for <strong>{formData.academyName || 'your academy'}</strong> shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Coach Vikram Sen"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@academy.com"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Academy / Club Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.academyName}
                    onChange={e => setFormData({ ...formData, academyName: e.target.value })}
                    placeholder="e.g. Achiever's Chess Academy"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Number of Students</label>
                  <select
                    value={formData.studentCount}
                    onChange={e => setFormData({ ...formData, studentCount: e.target.value })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="1-25">1 - 25 Students</option>
                    <option value="25-100">25 - 100 Students</option>
                    <option value="100-300">100 - 300 Students</option>
                    <option value="300+">300+ Students (Multi-Branch)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Preferred Demo Slot</label>
                  <select
                    value={formData.preferredTime}
                    onChange={e => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Morning">Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Afternoon">Afternoon (2:00 PM - 5:00 PM)</option>
                    <option value="Evening">Evening (6:00 PM - 9:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Any specific questions or current pain points?</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Currently using Chesslang and looking to switch for better classroom simul tools and automated parent reporting..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/25"
              >
                <Send className="w-4 h-4" /> Confirm Free Demo Booking
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
