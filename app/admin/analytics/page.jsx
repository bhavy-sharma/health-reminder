'use client';

import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  UserCircle2,
  Activity,
  IndianRupee,
  CalendarCheck,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import AdminSidebar from '@/components/admin/Sidebar';

/* ── Data ─────────────────────────────────────────────────── */
const statCards = [
  { icon: UserCircle2, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', value: '2,418', label: 'Total Patients', growth: '+8%', up: true },
  { icon: Activity, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', value: '247', label: 'Active Doctors', growth: '+5%', up: true },
  { icon: IndianRupee, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', value: '₹1.48L', label: 'Monthly Revenue', growth: '+9%', up: true },
  { icon: CalendarCheck, iconBg: 'bg-red-50', iconColor: 'text-red-400', value: '184', label: 'Appointments Today', growth: '-3%', up: false },
];

const userGrowthData = [
  { month: 'Jan', patients: 980, doctors: 38 },
  { month: 'Feb', patients: 1120, doctors: 55 },
  { month: 'Mar', patients: 1350, doctors: 78 },
  { month: 'Apr', patients: 1700, doctors: 110 },
  { month: 'May', patients: 2100, doctors: 180 },
  { month: 'Jun', patients: 2418, doctors: 247 },
];

const revenueData = [
  { month: 'Jan', value: 82000 },
  { month: 'Feb', value: 78000 },
  { month: 'Mar', value: 95000 },
  { month: 'Apr', value: 102000 },
  { month: 'May', value: 130000 },
  { month: 'Jun', value: 148000 },
];

const planData = [
  { name: 'Free', value: 158, color: '#d1d5db' },
  { name: 'Pro', value: 62, color: '#10b981' },
  { name: 'Premium', value: 27, color: '#f59e0b' },
];

const apptByDay = [
  { day: 'Mon', value: 130 },
  { day: 'Tue', value: 178 },
  { day: 'Wed', value: 160 },
  { day: 'Thu', value: 185 },
  { day: 'Fri', value: 170 },
  { day: 'Sat', value: 145 },
  { day: 'Sun', value: 65 },
];

const specialties = [
  { rank: 1, name: 'Cardiologist', count: 842 },
  { rank: 2, name: 'Diabetologist', count: 780 },
  { rank: 3, name: 'Orthopedic', count: 654 },
  { rank: 4, name: 'Pediatrician', count: 590 },
  { rank: 5, name: 'Neurologist', count: 432 },
  { rank: 6, name: 'Ophthalmologist', count: 380 },
];
const maxSpecialty = 842;

/* ── Main ─────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const [active, setActive] = useState('analytics');
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
        {/* Topbar with mobile menu button */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-400 hidden sm:inline">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
          <span className="text-sm font-semibold text-gray-700">Analytics</span>
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
          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Platform-wide performance · June 2026</p>
          </div>

          {/* Stat cards - Responsive grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map(({ icon: Icon, iconBg, iconColor, value, label, growth, up }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColor}`} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
                    up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
                  }`}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {growth}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* User Growth — full width */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">User Growth</h2>
            <p className="text-sm text-gray-400 mb-5">Patients and doctors registered — last 6 months</p>
            <div className="h-[200px] sm:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                  <Line type="monotone" dataKey="patients" stroke="#111827" strokeWidth={2.5} dot={false} name="Patients" />
                  <Line type="monotone" dataKey="doctors" stroke="#10b981" strokeWidth={2} dot={false} name="Doctors" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-6 h-0.5 bg-gray-900 inline-block rounded" /> Patients
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-6 h-0.5 bg-emerald-500 inline-block rounded" /> Doctors
              </span>
            </div>
          </div>

          {/* Revenue + Doctor Plan Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
            {/* Revenue bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Revenue</h2>
              <p className="text-sm text-gray-400 mb-4">Monthly doctor subscription revenue</p>
              <div className="h-[180px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip formatter={(v) => [`₹${(v / 1000).toFixed(0)}k`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col sm:flex-row justify-between mt-4 pt-4 border-t border-gray-50 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Jun Total</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">₹1,48,000</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-400">Avg/month</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">₹1,11,167</p>
                </div>
              </div>
            </div>

            {/* Donut chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900">Doctor Plan Distribution</h2>
              <p className="text-sm text-gray-400 mb-4">Free vs Pro vs Premium</p>
              <div className="flex-1 flex items-center justify-center h-[180px] sm:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {planData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-2">
                {planData.map(({ name, value, color }) => (
                  <span key={name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    {name} {value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Appointments by Day + Top Specialty Demand */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
            {/* Bar chart amber */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Appointments by Day</h2>
              <p className="text-sm text-gray-400 mb-4">Average weekly pattern</p>
              <div className="h-[180px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={apptByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Specialty Demand */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Top Specialty Demand</h2>
              <p className="text-sm text-gray-400 mb-5">Total bookings this month</p>
              <ul className="space-y-4">
                {specialties.map(({ rank, name, count }) => (
                  <li key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{rank}</span>
                        <span className="text-sm font-medium text-gray-800">{name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxSpecialty) * 100}%` }}
                      />
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