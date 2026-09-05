import React, { useState } from 'react';
import { ShieldCheck, Building2, Users, IndianRupee, TrendingUp, Server, Database, CheckCircle2, Search, Sliders, Sparkles } from 'lucide-react';

interface AcademyTenant {
  id: string;
  name: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  coaches: number;
  students: number;
  monthlyFee: string;
  status: 'Active' | 'Trial' | 'Pending';
}

const SAMPLE_TENANTS: AcademyTenant[] = [
  { id: 'acad-01', name: "Achiever's Chess Academy", plan: 'Pro', coaches: 6, students: 142, monthlyFee: '₹7,999', status: 'Active' },
  { id: 'acad-02', name: 'KnightSquad Club', plan: 'Enterprise', coaches: 14, students: 380, monthlyFee: '₹14,999', status: 'Active' },
  { id: 'acad-03', name: 'Grandmaster Academy', plan: 'Pro', coaches: 8, students: 210, monthlyFee: '₹7,999', status: 'Active' },
  { id: 'acad-04', name: 'ChessMasters India', plan: 'Enterprise', coaches: 18, students: 520, monthlyFee: '₹14,999', status: 'Active' },
  { id: 'acad-05', name: 'Castle Chess School', plan: 'Starter', coaches: 2, students: 32, monthlyFee: '₹3,499', status: 'Active' },
  { id: 'acad-06', name: 'Royal Bishop Club', plan: 'Pro', coaches: 5, students: 118, monthlyFee: '₹7,999', status: 'Active' },
];

export const SaasOwnerModule: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_TENANTS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      {/* SaaS Owner Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-3xl shadow-inner">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">SaaS Platform Command Center</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Superadmin (You)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Global tenant overview across all subscribed chess academies, platform revenue, and server health.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Hostinger LiteSpeed: 99.99% Uptime
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Academies</span>
          <div className="text-3xl font-extrabold text-white mt-1">152</div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14 this month
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Students</span>
          <div className="text-3xl font-extrabold text-white mt-1">12,480</div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Across 15 countries
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monthly Revenue (MRR)</span>
          <div className="text-3xl font-extrabold text-purple-300 mt-1">₹11,85,000</div>
          <span className="text-xs text-zinc-400 mt-1 block font-mono">
            ~$14,200 USD / mo
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Database Status</span>
          <div className="text-base font-bold text-white mt-1 font-mono">u586022648_chessplay</div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <Database className="w-3 h-3" /> Hostinger MySQL Connected
          </span>
        </div>
      </div>

      {/* Platform Tenant Directory */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white">Registered Academy Tenants</h3>
            <p className="text-xs text-zinc-400">View and manage all connected academies on your SaaS platform</p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search academies..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Academy</th>
                <th className="py-3 px-4 text-center">Plan Tier</th>
                <th className="py-3 px-4 text-center">Coaches</th>
                <th className="py-3 px-4 text-center">Students</th>
                <th className="py-3 px-4 text-center">Monthly Billing</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-white">
                        ♟
                      </div>
                      <div>
                        <div className="font-bold text-white">{t.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">ID: {t.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      t.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-300' : t.plan === 'Pro' ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-zinc-300">{t.coaches}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-zinc-300">{t.students}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{t.monthlyFee}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs font-bold text-purple-400 hover:underline">
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
