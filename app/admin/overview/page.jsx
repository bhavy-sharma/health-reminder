'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PlatformHealthCard from '@/components/PlatformHealthCard';
import toast, { Toaster } from 'react-hot-toast';

// ── Main Component ────────────────────────────────────────────
export default function AdminOverviewPage() {
  const router = useRouter();
  const [active, setActive] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: [],
    alerts: [],
    revenue: [],
    healthStats: [],
    newPatients: [],
    newDoctors: [],
    settings: { showPlatformHealth: false },
  });
  
  const handleTogglePlatformHealth = async () => {
    try {
      const newValue = !data.settings?.showPlatformHealth;
      // Optimistically update
      setData(prev => ({
        ...prev,
        settings: { ...prev.settings, showPlatformHealth: newValue }
      }));
      
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showPlatformHealth: newValue })
      });
      
      if (!res.ok) throw new Error('Failed to update settings');
      toast.success(newValue ? 'Platform Health section is now visible on Homepage' : 'Platform Health section hidden from Homepage');
    } catch (err) {
      console.error(err);
      toast.error('Could not update setting');
      // Revert on error
      setData(prev => ({
        ...prev,
        settings: { ...prev.settings, showPlatformHealth: !prev.settings.showPlatformHealth }
      }));
    }
  };

  // Icon mapping for dynamic icons
  const iconMap = {
    UserCircle2: UserCircle2,
    Activity: Activity,
    IndianRupee: IndianRupee,
    CreditCard: CreditCard,
    Flag: Flag,
    Clock: Clock,
    AlertCircle: AlertCircle,
    ShieldCheck: ShieldCheck,
  };

  // Pre-defined background colors for initials
  const avatarColors = [
    'bg-emerald-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-lime-500',
    'bg-fuchsia-500',
    'bg-sky-500',
  ];

  // Get consistent color for a name
  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    // Use the name to deterministically pick a color
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[index % avatarColors.length];
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch overview data
  const fetchOverviewData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/overview');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOverviewData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchOverviewData]);

  // Format Y-axis for revenue chart
  const formatY = (v) => `₹${v / 1000}k`;

  // Handle retry
  const handleRetry = () => {
    fetchOverviewData();
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOverviewData(true);
  };

  // Handle navigation
  const navigateTo = (path) => {
    router.push(path);
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
              <p className="text-gray-600">Loading dashboard...</p>
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
          <div className="flex items-center justify-center h-screen">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
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
      <Toaster position="top-right" />
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
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 relative">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            */}
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">SA</div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 max-w-[1300px] mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Admin Overview</h1>
            <p className="text-gray-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} · All systems operational
            </p>
          </div>

          {/* Alerts */}
          {data.alerts && data.alerts.length > 0 && (
            <div className="space-y-2">
              {data.alerts.map((alert, i) => {
                const Icon = iconMap[alert.icon] || AlertCircle;
                return (
                  <div key={i} className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border ${alert.bg || 'bg-gray-50 border-gray-200'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${alert.color || 'text-gray-600'}`} />
                    <span className={`text-xs sm:text-sm font-medium flex-1 ${alert.color || 'text-gray-600'}`}>
                      {alert.text}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${alert.color || 'text-gray-400'} shrink-0`} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {data.stats && data.stats.map((stat) => {
              const Icon = iconMap[stat.icon] || UserCircle2;
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.iconBg || 'bg-gray-50'} flex items-center justify-center`}>
                      <Icon className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${stat.iconColor || 'text-gray-500'}`} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                      <TrendingUp className="w-3 h-3" />{stat.growth || '0%'}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mt-0.5">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Revenue chart + Platform Health */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Platform Revenue</h2>
              <p className="text-sm text-gray-400 mb-5">Doctor subscription income — last 6 months</p>
              <div className="h-[180px] sm:h-[220px]">
                {data.revenue && data.revenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#9ca3af' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        tickFormatter={formatY} 
                        tick={{ fontSize: 11, fill: '#9ca3af' }} 
                        axisLine={false} 
                        tickLine={false} 
                        width={52} 
                      />
                      <Tooltip
                        formatter={(v) => [`₹${(v / 1000).toFixed(0)}k`, 'Revenue']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2.5} 
                        fill="url(#revGrad)" 
                        dot={false} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>

            {/* Platform Health */}
            <PlatformHealthCard 
              healthStats={data.healthStats} 
              rightElement={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Show on Homepage</span>
                  <button 
                    onClick={handleTogglePlatformHealth}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.settings?.showPlatformHealth ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.settings?.showPlatformHealth ? 'translate-x-4.5' : 'translate-x-1'}`} />
                  </button>
                </div>
              }
            />
          </div>

          {/* New Patients + Pending Verification */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">New Patients</h2>
                <button 
                  onClick={() => navigateTo('/admin/patients')}
                  className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline transition-colors"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-4">
                {data.newPatients && data.newPatients.length > 0 ? (
                  data.newPatients.map((p) => {
                    const color = p.color || getAvatarColor(p.name);
                    const initials = p.initials || getInitials(p.name);
                    return (
                      <li key={p.name} className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400 truncate">{p.location} · {p.time}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.planColor || 'bg-gray-100 text-gray-600'} shrink-0`}>
                          {p.plan}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-center text-gray-400 py-4 text-sm">No new patients</li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">New Doctors</h2>
                <button 
                  onClick={() => navigateTo('/admin/doctors')}
                  className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline transition-colors"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-4">
                {data.newDoctors && data.newDoctors.length > 0 ? (
                  data.newDoctors.map((d) => {
                    const color = d.color || getAvatarColor(d.name);
                    const initials = d.initials || getInitials(d.name);
                    return (
                      <li key={d.name} className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.name}</p>
                          <p className="text-xs text-gray-400 truncate">{d.spec}</p>
                          <p className="text-[11px] text-gray-300 font-mono truncate">{d.mci}</p>
                        </div>
                        {d.isVerified === false && (
                          <div className="flex flex-col gap-1 shrink-0">
                            <button className="text-xs font-semibold text-white bg-amber-500 px-2 py-0.5 rounded transition-colors">
                              Pending
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="text-center text-gray-400 py-4 text-sm">No new doctors</li>
                )}
              </ul>
            </div>
          </div>

          {/* Last updated timestamp */}
          <div className="text-center text-xs text-gray-400 py-2">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}