'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bell,
  Upload,
  Stethoscope,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Search,
  Users,
  Loader2,
  Calendar,
  Activity,
  Heart,
  Pill,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Clock,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    membersCount: 0,
    recordsCount: 0,
    adherenceRate: '92%'
  });
  const [attentionItems, setAttentionItems] = useState([]);
  const [attentionLoading, setAttentionLoading] = useState(true);
  const [familyId, setFamilyId] = useState(null);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          if (data.user?.activeFamilyId) {
            const fid = data.user.activeFamilyId._id || data.user.activeFamilyId;
            setFamilyId(fid);
            
            // Gather details
            const membersRes = await fetch(`/api/family/members?familyId=${fid}`);
            if (membersRes.ok) {
              const membersData = await membersRes.json();
              const membersList = membersData.members || [];
              
              // Count health records
              const recRes = await fetch(`/api/health-records?familyId=${fid}`);
              let recordsList = [];
              if (recRes.ok) {
                const recData = await recRes.json();
                recordsList = recData.records || [];
              }

              setStats({
                membersCount: membersList.length,
                recordsCount: recordsList.length,
                adherenceRate: '94%'
              });

              // Fetch attention items (reminders)
              await fetchAttentionItems(fid);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user dashboard info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndStats();
  }, []);

  const fetchAttentionItems = async (fid) => {
    try {
      setAttentionLoading(true);
      
      // Fetch today's reminder logs
      const logsRes = await fetch(`/api/medicine-reminder?familyId=${fid}`);
      if (logsRes.ok) {
        const data = await logsRes.json();
        const todayLogs = data.todayLogs || [];
        
        // Filter items that need attention
        const attention = [];
        
        // 1. Pending reminders (Sent status)
        const pendingReminders = todayLogs.filter(log => log.status === 'Sent');
        pendingReminders.forEach(log => {
          attention.push({
            id: log._id,
            type: 'pending',
            title: `💊 ${log.medicineName} pending`,
            description: `Waiting for ${log.memberId?.name || 'member'} to confirm taking ${log.medicineName}`,
            time: log.scheduledTime ? new Date(log.scheduledTime).toLocaleTimeString() : '',
            severity: 'warning',
            link: '/medicine-tracker'
          });
        });

        // 2. Missed reminders
        const missedReminders = todayLogs.filter(log => log.status === 'Missed');
        missedReminders.forEach(log => {
          attention.push({
            id: log._id,
            type: 'missed',
            title: `⚠️ ${log.medicineName} missed`,
            description: `${log.memberId?.name || 'Member'} missed ${log.medicineName} at ${log.scheduledTime ? new Date(log.scheduledTime).toLocaleTimeString() : ''}`,
            time: log.scheduledTime ? new Date(log.scheduledTime).toLocaleTimeString() : '',
            severity: 'critical',
            link: '/medicine-tracker'
          });
        });

        // 3. Recently taken (show as completed)
        const takenReminders = todayLogs.filter(log => log.status === 'Taken');
        takenReminders.slice(0, 3).forEach(log => {
          attention.push({
            id: log._id,
            type: 'completed',
            title: `✅ ${log.medicineName} taken`,
            description: `${log.memberId?.name || 'Member'} took ${log.medicineName}`,
            time: log.takenAt ? new Date(log.takenAt).toLocaleTimeString() : '',
            severity: 'success',
            link: '/medicine-tracker'
          });
        });

        // Sort: critical first, then warning, then success
        const severityOrder = { critical: 0, warning: 1, success: 2 };
        attention.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        setAttentionItems(attention);
      }
    } catch (error) {
      console.error('Failed to fetch attention items:', error);
    } finally {
      setAttentionLoading(false);
    }
  };

  // Auto-refresh attention items every 30 seconds
  useEffect(() => {
    if (!familyId) return;

    const interval = setInterval(() => {
      fetchAttentionItems(familyId);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [familyId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    if (!user?.fullName) return '';
    return user.fullName.split(' ')[0];
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const quickActions = [
    { icon: Upload, label: 'Upload Report', desc: 'Add files & lab reports', href: '/health-records', color: 'blue' },
    { icon: Bell, label: 'Set Reminders', desc: 'WhatsApp & SMS triggers', href: '/medicine-tracker', color: 'indigo' },
    { icon: Stethoscope, label: 'Doctor Visit Prep', desc: 'Export condition sheets', href: '/doctor-visit', color: 'emerald' },
    { icon: Pill, label: 'Medicine Tracker', desc: 'View all medicine logs', href: '/medicine-tracker', color: 'rose' }
  ];

  // Render attention items
  const renderAttentionItems = () => {
    if (attentionLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-[#475569]">Loading reminders...</span>
        </div>
      );
    }

    if (attentionItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-[#E2E8F0] rounded-xl bg-emerald-50/40 p-6">
          <CheckCircle className="w-10 h-10 mb-3 text-emerald-600" />
          <p className="text-sm font-bold text-[#111827]">All caught up!</p>
          <p className="text-xs text-[#475569] mt-1">No pending medicine alerts or missing records right now.</p>
          <Link
            href="/medicine-tracker"
            className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
          >
            View Medicine Tracker
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      );
    }

    // Filter to show only pending and missed items (not completed)
    const activeItems = attentionItems.filter(item => item.severity !== 'success');
    const completedItems = attentionItems.filter(item => item.severity === 'success');

    if (activeItems.length === 0 && completedItems.length > 0) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">All reminders completed today! 🎉</p>
          </div>
          <div className="text-xs text-[#475569]">
            {completedItems.length} reminder{completedItems.length > 1 ? 's' : ''} taken today
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {activeItems.slice(0, 5).map((item) => {
          const severityColors = {
            critical: 'border-red-200 bg-red-50 hover:bg-red-100',
            warning: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
            success: 'border-green-200 bg-green-50 hover:bg-green-100'
          };
          const iconMap = {
            critical: <AlertTriangle className="w-4 h-4 text-red-600" />,
            warning: <Clock className="w-4 h-4 text-yellow-600" />,
            success: <CheckCircle className="w-4 h-4 text-green-600" />
          };

          return (
            <Link
              key={item.id}
              href={item.link || '#'}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${severityColors[item.severity]}`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {iconMap[item.severity]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827] truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#475569] truncate">
                    {item.description}
                  </p>
                  {item.time && (
                    <p className="text-[10px] text-[#475569] mt-0.5">
                      🕐 {item.time}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#475569] flex-shrink-0 ml-2" />
            </Link>
          );
        })}

        {activeItems.length > 5 && (
          <Link
            href="/medicine-tracker"
            className="block text-center text-xs font-semibold text-blue-600 hover:underline py-2"
          >
            + {activeItems.length - 5} more items
          </Link>
        )}

        {completedItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#475569]">
              ✅ {completedItems.length} reminder{completedItems.length > 1 ? 's' : ''} completed today
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-[#E2E8F0]">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E40AF] text-xs font-bold rounded-full tracking-wider uppercase">
                Command Center
              </span>
              <h1 className="text-3xl font-bold text-[#111827] mt-3 tracking-tight">
                {loading ? 'Welcome back 👋' : `${getGreeting()}, ${getFirstName() || 'User'} 👋`}
              </h1>
              <p className="text-sm text-[#475569] mt-1 font-medium">{todayFormatted}</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left/Middle (Colspan-2) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Dynamic Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Family Members</span>
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#111827] mt-4">{stats.membersCount}</p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-1">Configured family slots</p>
                </div>

                <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Uploaded Records</span>
                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#1E40AF]" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#111827] mt-4">{stats.recordsCount}</p>
                  <p className="text-[11px] text-[#1E40AF] font-semibold mt-1">Prescriptions & labs</p>
                </div>

                <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Adherence Rate</span>
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 mt-4">{stats.adherenceRate}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Medicine checks status</p>
                </div>

              </div>

              {/* Family Health Overview */}
              <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#111827]">Family Health Overview</h3>
                    <p className="text-xs text-[#475569] mt-0.5">Quick summary of family member health cards</p>
                  </div>
                  <Link href="/family-members" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    Manage Family <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {stats.membersCount === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#E2E8F0] rounded-xl bg-slate-50/50 p-6">
                    <Users className="w-12 h-12 mb-3 text-[#475569]/40" />
                    <p className="text-sm font-bold text-[#111827]">No family members added yet</p>
                    <p className="text-xs text-[#475569] mt-1 max-w-xs leading-relaxed">Add family members to keep their lab reports, blood group, and prescriptions in one safe place.</p>
                    <Link
                      href="/family-members"
                      className="mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                    >
                      + Add Family Member
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-[#111827]">Family setup configured correctly</p>
                        <p className="text-xs text-[#475569] mt-0.5">You have active profiles configured on this account.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* What needs your attention today */}
              <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#111827]">What needs your attention today</h3>
                    <p className="text-xs text-[#475569] mt-0.5">
                      {attentionItems.length > 0 
                        ? `${attentionItems.filter(i => i.severity !== 'success').length} pending items`
                        : 'All clear!'}
                    </p>
                  </div>
                  <Link
                    href="/medicine-tracker"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {renderAttentionItems()}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-bold text-[#111827] mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    const colors = {
                      blue: 'bg-blue-50/50 hover:bg-blue-50 border-blue-100 text-blue-700',
                      indigo: 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100 text-[#1E40AF]',
                      emerald: 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100 text-emerald-700',
                      rose: 'bg-rose-50/50 hover:bg-rose-50 border-rose-100 text-rose-700'
                    };
                    return (
                      <Link
                        href={action.href}
                        key={index}
                        className={`flex flex-col items-start p-5 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${colors[action.color]}`}
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm mb-4">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-[#111827]">{action.label}</span>
                        <span className="text-[10px] text-[#475569] mt-1 line-clamp-2 leading-relaxed">{action.desc}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Account Card */}
              {!loading && user && (
                <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6">
                  <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-4">Your Profile</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0B1F4D] to-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-sm">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#111827] truncate">{user.fullName}</p>
                      <p className="text-xs text-[#475569] truncate mt-0.5">{user.email}</p>
                      {user.mobile && <p className="text-[11px] text-[#475569] mt-0.5">{user.mobile}</p>}
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-[#1E40AF] text-[9px] rounded-full font-bold uppercase tracking-wider">
                        {user.role || 'patient'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Records */}
              <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-[#111827]">Recent Records</h3>
                  <Link href="/health-records" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-slate-50/50 p-4">
                  <FileText className="w-10 h-10 mb-2.5 text-[#475569]/30" />
                  <p className="text-xs font-bold text-[#111827]">No records uploaded yet</p>
                  <p className="text-[10px] text-[#475569] mt-0.5">Upload visit summaries & reports.</p>
                  <Link
                    href="/health-records"
                    className="mt-4 px-4 py-2 bg-[#0B1F4D] hover:bg-[#071433] text-white text-[11px] font-bold rounded-lg transition"
                  >
                    Upload Record
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}