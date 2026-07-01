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
  Heart
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const quickActions = [
    { icon: Upload, label: 'Upload Report', color: 'blue', href: '/health-records' },
    { icon: Bell, label: 'Set Reminder', color: 'purple', href: '/medicine-tracker' },
    { icon: Stethoscope, label: 'Doctor Visit Prep', color: 'green', href: '/doctor-visit' },
    { icon: AlertCircle, label: 'Emergency Info', color: 'red', href: '/settings' }
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF8F5]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Command Center</span>
              {loading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-gray-400 text-sm font-medium">Loading profile...</span>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-serif font-bold text-gray-900 mt-0.5">
                    {getGreeting()}, {getFirstName() || 'there'} 👋
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{todayFormatted}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records, members..."
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent bg-white w-48 lg:w-64 text-sm shadow-sm"
                />
              </div>
              <button className="p-3 rounded-full bg-white border border-gray-150 shadow-sm hover:bg-gray-50 transition">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column (Colspan-2): Overview & Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Family Health Overview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-gray-900">Family Health Overview</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Quick summary of family member health cards</p>
                  </div>
                  <Link href="/family-members" className="text-sm font-semibold text-gray-900 hover:underline flex items-center gap-1">
                    Manage <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {/* Empty state — family members come from real API once set up */}
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 p-6">
                  <Users className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-700">No family members added yet</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">Add family members to keep their lab reports, blood group, and prescriptions in one safe place.</p>
                  <Link
                    href="/family-members"
                    className="mt-5 px-5 py-2.5 bg-[#0D1B2A] text-white text-xs font-semibold rounded-xl hover:bg-[#1a2e44] transition-colors shadow-sm"
                  >
                    + Add Family Member
                  </Link>
                </div>
              </div>

              {/* What needs attention */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">What needs your attention today</h3>
                <div className="flex flex-col items-center justify-center py-10 text-center border border-gray-100 rounded-xl bg-emerald-50/30 p-6">
                  <CheckCircle className="w-10 h-10 mb-3 text-emerald-500" />
                  <p className="text-sm font-semibold text-gray-700">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No pending medicine alerts or missing records right now.</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    const colors = {
                      blue: 'bg-blue-50/50 text-blue-600 hover:bg-blue-50 border-blue-100',
                      purple: 'bg-purple-50/50 text-purple-600 hover:bg-purple-50 border-purple-100',
                      green: 'bg-green-50/50 text-green-600 hover:bg-green-50 border-green-100',
                      red: 'bg-red-50/50 text-red-600 hover:bg-red-50 border-red-100'
                    };
                    return (
                      <Link 
                        href={action.href}
                        key={index}
                        className={`flex flex-col items-center justify-center p-5 rounded-xl border transition shadow-sm ${colors[action.color]}`}
                      >
                        <Icon className="w-6 h-6 mb-2" />
                        <span className="text-xs font-semibold text-center">{action.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Profile Summary & Storage/ABHA card */}
            <div className="space-y-6">
              
              {/* Account Card */}
              {!loading && user && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Profile</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#0D1B2A] flex items-center justify-center text-white text-xl font-serif font-bold shadow-sm">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.mobile && <p className="text-xs text-gray-400 mt-0.5">{user.mobile}</p>}
                      <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-full font-bold uppercase">
                        {user.role || 'patient'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Records */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Records</h3>
                  <Link href="/health-records" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 p-4">
                  <FileText className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="text-xs font-semibold text-gray-700">No records uploaded yet</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Upload doctor visit summaries, ECGs, and reports.</p>
                  <Link
                    href="/health-records"
                    className="mt-4 px-4 py-2 bg-[#0D1B2A] text-white text-[11px] font-semibold rounded-lg hover:bg-[#1a2e44] transition"
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
};

export default Dashboard;