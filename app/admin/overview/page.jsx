'use client';

import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  TrendingUp,
  UserCircle2,
  Activity,
  IndianRupee,
  CreditCard,
  Flag,
  Clock,
  AlertCircle,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import AdminSidebar from '@/components/admin/Sidebar';

// ── Data ──────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jan', value: 82000 },
  { month: 'Feb', value: 78000 },
  { month: 'Mar', value: 95000 },
  { month: 'Apr', value: 88000 },
  { month: 'May', value: 120000 },
  { month: 'Jun', value: 148000 },
];

const formatY = (v) => `₹${v / 1000}k`;

const stats = [
  { icon: UserCircle2, iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   value: '2,418',  label: 'Total Patients',   sub: 'Active families',  growth: '+8%'  },
  { icon: Activity,    iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', value: '247',    label: 'Verified Doctors', sub: '12 pending',        growth: '+5%'  },
  { icon: IndianRupee, iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  value: '₹1.48L', label: 'Monthly Revenue',  sub: 'June 2026',         growth: '+9%'  },
  { icon: CreditCard,  iconBg: 'bg-red-50',    iconColor: 'text-red-500',    value: '89',     label: 'Paid Doctors',     sub: 'Pro + Premium',     growth: '+12%' },
];

const alerts = [
  { icon: Flag,        text: '5 reviews flagged for moderation',       color: 'text-red-600',    bg: 'bg-red-50  border-red-100'    },
  { icon: Clock,       text: '12 doctors awaiting verification',        color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
  { icon: AlertCircle, text: '3 failed Razorpay payments need attention', color: 'text-teal-600',   bg: 'bg-teal-50  border-teal-100'  },
];

const newPatients = [
  { initials: 'RS', color: 'bg-emerald-500', name: 'Ramesh Sharma',  location: 'Mumbai',    time: '2 hrs ago',  plan: 'Family', planColor: 'bg-gray-100 text-gray-600' },
  { initials: 'AK', color: 'bg-amber-500',   name: 'Anita Kulkarni', location: 'Pune',      time: '5 hrs ago',  plan: 'Free',   planColor: 'bg-gray-100 text-gray-500' },
  { initials: 'VP', color: 'bg-red-500',     name: 'Vijay Patel',    location: 'Ahmedabad', time: '1 day ago',  plan: 'Family', planColor: 'bg-gray-100 text-gray-600' },
  { initials: 'SR', color: 'bg-slate-600',   name: 'Sunita Rao',     location: 'Bangalore', time: '1 day ago',  plan: 'Free',   planColor: 'bg-gray-100 text-gray-500' },
];

const pendingDoctors = [
  { initials: 'AM', color: 'bg-amber-500',   name: 'Dr. Arjun Mehta',  spec: 'Neurologist · Delhi',     mci: 'MCI-DL-2018-12345'  },
  { initials: 'KS', color: 'bg-emerald-600', name: 'Dr. Kavya Singh',  spec: 'Pediatrician · Mumbai',   mci: 'MCI-MH-2015-67890'  },
  { initials: 'RG', color: 'bg-blue-600',    name: 'Dr. Rahul Gupta',  spec: 'Diabetologist · Hyderabad', mci: 'MCI-AP-2012-11223' },
];

const healthStats = [
  { label: 'Avg Doctor Rating',    value: '4.7 ★', valueColor: 'text-amber-500' },
  { label: 'Review Response Rate', value: '74%',   valueColor: 'text-gray-900'  },
  { label: 'Appointments Today',   value: '184',   valueColor: 'text-gray-900'  },
  { label: 'Active Medicines',     value: '9,312', valueColor: 'text-gray-900'  },
  { label: 'Docs Uploaded',        value: '41.2k', valueColor: 'text-gray-900'  },
  { label: 'WhatsApp Reminders',   value: '3,100', valueColor: 'text-emerald-600' },
];

// ── Main Component ────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [active, setActive] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex">
      <AdminSidebar 
        active={active} 
        setActive={setActive} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 w-full md:pl-[260px]">
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center gap-2">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-400 hidden sm:inline">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
          <span className="text-sm font-semibold text-gray-700">Overview</span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Admin
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">SA</div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 max-w-[1300px] mx-auto">
          {/* Rest of your page content... */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Admin Overview</h1>
            <p className="text-gray-400 text-sm mt-1">Friday, 27 June 2026 · All systems operational</p>
          </div>

          {/* Alerts */}
          <div className="space-y-2">
            {alerts.map(({ icon: Icon, text, color, bg }, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border ${bg}`}>
                <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                <span className={`text-xs sm:text-sm font-medium flex-1 ${color}`}>{text}</span>
                <ChevronRight className={`w-4 h-4 ${color} shrink-0`} />
              </div>
            ))}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map(({ icon: Icon, iconBg, iconColor, value, label, sub, growth }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${iconColor}`} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                    <TrendingUp className="w-3 h-3" />{growth}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart + Platform Health */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Platform Revenue</h2>
              <p className="text-sm text-gray-400 mb-5">Doctor subscription income — last 6 months</p>
              <div className="h-[180px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip
                      formatter={(v) => [`₹${(v / 1000).toFixed(0)}k`, 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Platform Health</h2>
              <ul className="space-y-3">
                {healthStats.map(({ label, value, valueColor }) => (
                  <li key={label} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs sm:text-sm text-gray-500">{label}</span>
                    <span className={`text-xs sm:text-sm font-bold ${valueColor}`}>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* New Patients + Pending Verification */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">New Patients</h2>
                <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-4">
                {newPatients.map((p) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${p.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{p.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.location} · {p.time}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.planColor} shrink-0`}>{p.plan}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Pending Verification</h2>
                <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-4">
                {pendingDoctors.map((d) => (
                  <li key={d.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${d.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{d.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{d.name}</p>
                      <p className="text-xs text-gray-400 truncate">{d.spec}</p>
                      <p className="text-[11px] text-gray-300 font-mono truncate">{d.mci}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button className="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-lg transition-colors">Verify</button>
                      <button className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Reject</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}