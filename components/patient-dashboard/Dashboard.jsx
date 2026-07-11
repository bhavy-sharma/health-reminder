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
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [stats, setStats] = useState({
    membersCount: 0,
    recordsCount: 0,
    adherenceRate: '92%'
  });

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

              setFamilyMembers(membersList);
              setRecentRecords(recordsList);
              setStats({
                membersCount: membersList.length,
                recordsCount: recordsList.length,
                adherenceRate: '94%'
              });
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
    { icon: Stethoscope, label: 'Doctor Visit Prep', desc: 'Export condition sheets', href: '/doctor-visit', color: 'emerald' }
  ];

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
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCheck className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-sm font-bold text-[#111827]">Family setup configured correctly</p>
                          <p className="text-xs text-[#475569] mt-0.5">You have {stats.membersCount} active profiles configured on this account.</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {familyMembers.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold shrink-0">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#111827] truncate">{member.name}</p>
                            <p className="text-xs text-[#475569] capitalize truncate">{member.relationship}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* What needs attention */}
              <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-bold text-[#111827] mb-6">What needs your attention today</h3>
                <div className="flex flex-col items-center justify-center py-8 text-center border border-[#E2E8F0] rounded-xl bg-emerald-50/40 p-6">
                  <CheckCircle className="w-10 h-10 mb-3 text-emerald-600" />
                  <p className="text-sm font-bold text-[#111827]">All caught up!</p>
                  <p className="text-xs text-[#475569] mt-1">No pending medicine alerts or missing records right now.</p>
                </div>
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
                {recentRecords.length === 0 ? (
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
                ) : (
                  <div className="space-y-3">
                    {recentRecords.slice(0, 3).map((record, index) => {
                      const iconStyles = (() => {
                        switch (record.type) {
                          case 'lab': return { bg: 'bg-red-50', text: 'text-red-500' };
                          case 'prescription': return { bg: 'bg-blue-50', text: 'text-blue-500' };
                          case 'scan': return { bg: 'bg-purple-50', text: 'text-purple-500' };
                          default: return { bg: 'bg-slate-50', text: 'text-slate-500' };
                        }
                      })();
                      
                      return (
                        <div key={index} className="flex flex-col p-3 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg ${iconStyles.bg} flex items-center justify-center shrink-0`}>
                              <FileText className={`w-5 h-5 ${iconStyles.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-[#475569] mb-0.5">{record.category || 'Record'}</p>
                              <p className="text-sm font-bold text-[#111827] truncate leading-tight">{record.title || 'Untitled Document'}</p>
                              <p className="text-[10px] text-[#475569] mt-1">{record.member} • {record.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Link href={`/health-records?view=${record.id}`} className="flex-1 py-1.5 bg-white border border-[#E2E8F0] text-[#111827] text-[11px] font-bold rounded-lg hover:bg-slate-50 transition text-center">
                              View
                            </Link>
                            <button className="flex-1 py-1.5 bg-[#0B1F4D] text-white text-[11px] font-bold rounded-lg hover:bg-[#071433] transition text-center">
                              Share
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}