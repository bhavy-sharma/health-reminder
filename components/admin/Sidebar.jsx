'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart2,
  Users,
  Stethoscope,
  Star,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Loader2,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const adminNav = {
  main: [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin/overview' },
    { key: 'analytics', label: 'Analytics', icon: BarChart2, href: '/admin/analytics' },
  ],
  people: [
    { key: 'patients', label: 'Patients', icon: Users, href: '/admin/patients' },
    { key: 'doctors', label: 'Doctors', icon: Stethoscope, href: '/admin/doctors' },
  ],
  business: [
    { key: 'reviews', label: 'Reviews', icon: Star, href: '/admin/reviews' },
  ],
  support: [
    { key: 'queries', label: 'Doctor Queries', icon: MessageCircle, href: '/admin/queries' },
  ],
};

export default function AdminSidebar({ active, setActive, isMobileOpen, setIsMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminData, setAdminData] = useState({
    name: 'Admin',
    email: '',
    role: 'admin',
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingDoctors: 0,
    flaggedReviews: 0,
    totalPatients: 0,
    openQueries: 0,
  });

  const getActiveFromPath = () => {
    if (pathname?.includes('/admin/overview')) return 'overview';
    if (pathname?.includes('/admin/analytics')) return 'analytics';
    if (pathname?.includes('/admin/patients')) return 'patients';
    if (pathname?.includes('/admin/doctors')) return 'doctors';
    if (pathname?.includes('/admin/reviews')) return 'reviews';
    if (pathname?.includes('/admin/queries')) return 'queries';
    return active || 'overview';
  };

  const currentActive = getActiveFromPath();

  // Fetch admin data and stats
  useEffect(() => {
    fetchAdminData();
    fetchStats();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAdminData({
            name: data.data.fullName || data.data.name || 'Admin',
            email: data.data.email || '',
            role: data.data.role || 'admin',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch pending doctors count
      const doctorsRes = await fetch('/api/admin/doctors?status=pending&limit=1');
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        if (doctorsData.success) {
          setStats(prev => ({ ...prev, pendingDoctors: doctorsData.data.total || 0 }));
        }
      }

      // Fetch flagged reviews count
      const reviewsRes = await fetch('/api/admin/reviews?status=flagged&limit=1');
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        if (reviewsData.success) {
          setStats(prev => ({ ...prev, flaggedReviews: reviewsData.data.total || 0 }));
        }
      }

      // Fetch total patients count
      const patientsRes = await fetch('/api/admin/patients?limit=1');
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        if (patientsData.success) {
          setStats(prev => ({ ...prev, totalPatients: patientsData.data.total || 0 }));
        }
      }

      // ─── Fetch open queries count ───
      const queriesRes = await fetch('/api/admin/queries?status=open,in_progress&limit=1');
      if (queriesRes.ok) {
        const queriesData = await queriesRes.json();
        if (queriesData.success) {
          const openCount = queriesData.data.counts?.open || 0;
          const inProgressCount = queriesData.data.counts?.in_progress || 0;
          setStats(prev => ({ ...prev, openQueries: openCount + inProgressCount }));
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        router.push('/login');
        router.refresh();
      } else {
        const data = await response.json();
        console.error('Logout failed:', data.error);
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'flagged':
        return 'bg-red-100 text-red-600';
      case 'patients':
        return 'bg-blue-100 text-blue-600';
      case 'queries':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-[#1a2e44]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/20">
            F
          </div>
          <div>
            <p className="text-base font-bold text-white">FamilyHealth</p>
            <p className="text-[11px] font-semibold tracking-widest text-blue-300 uppercase">Admin Console</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 bg-blue-900/30 border border-blue-700/30 rounded-xl px-3 py-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-sm font-semibold text-blue-300">
            {loading ? 'Loading...' : `${adminData.role.charAt(0).toUpperCase() + adminData.role.slice(1)} Admin`}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {[
          { title: 'Main', items: adminNav.main },
          { title: 'People', items: adminNav.people.map(item => ({
              ...item,
              badge: item.key === 'patients' && stats.totalPatients > 0 
                ? `${stats.totalPatients > 1000 ? (stats.totalPatients/1000).toFixed(1) + 'k' : stats.totalPatients}` 
                : undefined,
              badgeColor: item.key === 'patients' ? getBadgeColor('patients') : undefined,
            }))},
          { title: 'Business', items: adminNav.business.map(item => ({
              ...item,
              badge: item.key === 'reviews' && stats.flaggedReviews > 0 
                ? `${stats.flaggedReviews} flagged` 
                : undefined,
              badgeColor: item.key === 'reviews' ? getBadgeColor('flagged') : undefined,
            }))},
          // ─── Support Section ───
          { title: 'Support', items: adminNav.support.map(item => ({
              ...item,
              badge: stats.openQueries > 0 ? `${stats.openQueries}` : undefined,
              badgeColor: stats.openQueries > 0 ? getBadgeColor('queries') : undefined,
            }))},
        ].map(({ title, items }) => (
          <div key={title}>
            <p className="text-[10px] font-bold tracking-widest text-blue-400/60 uppercase px-2 mb-1.5">{title}</p>
            {items.map(({ key, label, icon: Icon, href, badge, badgeColor }) => {
              const isActive = currentActive === key;
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => {
                    if (setActive) setActive(key);
                    if (setIsMobileOpen) setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                  <span className="flex-1 text-left">{label}</span>
                  {badge && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor || 'bg-gray-100 text-gray-600'}`}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#1a2e44] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-amber-500/20">
            {loading ? 'A' : getInitials(adminData.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {loading ? 'Loading...' : adminData.name}
            </p>
            <p className="text-xs text-blue-300 truncate">
              {loading ? '...' : adminData.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <Link 
            href="/patient/dashboard" 
            className="flex-1 text-xs font-medium text-blue-300 border border-blue-700/30 rounded-lg py-1.5 text-center hover:bg-blue-900/30 transition-colors"
          >
            Patient View
          </Link>
          <Link 
            href="/doctor/dashboard" 
            className="flex-1 text-xs font-medium text-blue-300 border border-blue-700/30 rounded-lg py-1.5 text-center hover:bg-blue-900/30 transition-colors"
          >
            Doctor View
          </Link>
        </div>
        <button 
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 text-xs text-blue-400 hover:text-white px-1 py-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loggingOut ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Logging out...
            </>
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] h-screen bg-[#0A1628] border-r border-[#1a2e44] flex-col fixed left-0 top-0 z-40 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#0A1628] border-r border-[#1a2e44] shadow-2xl overflow-y-auto animate-slide-in">
            <div className="p-4 border-b border-[#1a2e44] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/20">
                  F
                </div>
                <div>
                  <p className="text-base font-bold text-white">FamilyHealth</p>
                  <p className="text-[11px] font-semibold tracking-widest text-blue-300 uppercase">Admin Console</p>
                </div>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="text-blue-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-3">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}