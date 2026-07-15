// app/admin/analytics/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import AdminSidebar from '@/components/admin/Sidebar';

// ── Main ───────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [active, setActive] = useState('analytics');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    statCards: [],
    userGrowth: [],
    monthlyRevenue: [],
    doctorPlanDistribution: [],
    appointmentsByDay: [],
  });

  // Icon mapping
  const iconMap = {
    UserCircle2: UserCircle2,
    Activity: Activity,
    IndianRupee: IndianRupee,
    CalendarCheck: CalendarCheck,
  };

  // Format currency without "L"
  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}k`;
    }
    return `₹${value}`;
  };

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/analytics');
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch analytics';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to load analytics');
      }

      setData(result.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalyticsData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  // Handle retry
  const handleRetry = () => {
    fetchAnalyticsData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex">
        <AdminSidebar
          active={active}
          setActive={setActive}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        <main className="flex-1 w-full md:pl-[260px]">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex">
        <AdminSidebar
          active={active}
          setActive={setActive}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        <main className="flex-1 w-full md:pl-[260px]">
          <div className="flex items-center justify-center h-screen p-4">
            <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <span className="text-sm font-semibold text-gray-700">Analytics</span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Admin
            </div>
            {/*
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>
            */}
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">SA</div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 max-w-[1300px] mx-auto">
          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">
              Platform-wide performance · {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* ─── Stat Cards ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {data.statCards && data.statCards.length > 0 ? (
              data.statCards.map((stat) => {
                const Icon = iconMap[stat.icon] || UserCircle2;
                return (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.iconColor}`} />
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
                        stat.up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
                      }`}>
                        {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.growth}
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mt-0.5">{stat.label}</p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 text-center text-gray-400 py-8">
                No statistics available
              </div>
            )}
          </div>

          {/* ─── User Growth ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">User Growth</h2>
            <p className="text-sm text-gray-400 mb-5">Patients and doctors registered — last 6 months</p>
            <div className="h-[200px] sm:h-[240px]">
              {data.userGrowth && data.userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.userGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                    <Line type="monotone" dataKey="patients" stroke="#111827" strokeWidth={2.5} dot={false} name="Patients" />
                    <Line type="monotone" dataKey="doctors" stroke="#10b981" strokeWidth={2} dot={false} name="Doctors" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No user growth data available
                </div>
              )}
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

          {/* ─── Doctor Plan Distribution + Monthly Revenue ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Doctor Plan Distribution - Donut Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Doctor Plan Distribution</h2>
              <p className="text-sm text-gray-400 mb-4">Free vs Pro vs Premium</p>
              <div className="flex-1 flex items-center justify-center h-[200px] sm:h-[240px]">
                {data.doctorPlanDistribution && data.doctorPlanDistribution.length > 0 && 
                 data.doctorPlanDistribution.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.doctorPlanDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                        labelLine={false}
                      >
                        {data.doctorPlanDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(v, name) => [`${v} doctors`, name]} 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-400 text-sm">No plan data available</div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-2">
                {data.doctorPlanDistribution && data.doctorPlanDistribution.map(({ name, value, color }) => (
                  <span key={name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    {name}: {value}
                  </span>
                ))}
              </div>
            </div>

            {/* Monthly Revenue - Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Monthly Revenue</h2>
              <p className="text-sm text-gray-400 mb-4">Revenue from subscriptions & plan upgrades</p>
              <div className="h-[200px] sm:h-[240px]">
                {data.monthlyRevenue && data.monthlyRevenue.length > 0 && 
                 data.monthlyRevenue.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis 
                        tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`} 
                        tick={{ fontSize: 11, fill: '#9ca3af' }} 
                        axisLine={false} 
                        tickLine={false} 
                        width={48} 
                      />
                      <Tooltip 
                        formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} 
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Appointments by Day ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">Appointments by Day</h2>
            <p className="text-sm text-gray-400 mb-4">Weekly appointment distribution</p>
            <div className="h-[180px] sm:h-[220px]">
              {data.appointmentsByDay && data.appointmentsByDay.length > 0 && 
               data.appointmentsByDay.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.appointmentsByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No appointment data available
                </div>
              )}
            </div>
          </div>

          {/* Last updated */}
          <div className="text-center text-xs text-gray-400 py-2">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}