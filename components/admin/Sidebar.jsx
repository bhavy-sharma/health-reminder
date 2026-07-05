'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNav = {
  main: [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin/overview' },
    { key: 'analytics', label: 'Analytics', icon: BarChart2, href: '/admin/analytics' },
  ],
  people: [
    { key: 'patients', label: 'Patients', icon: Users, href: '/admin/patients', badge: '2.4k', badgeColor: 'bg-gray-100 text-gray-600' },
    { key: 'doctors', label: 'Doctors', icon: Stethoscope, href: '/admin/doctors', badge: '3 pending', badgeColor: 'bg-amber-100 text-amber-700' },
  ],
  business: [
    { key: 'reviews', label: 'Reviews', icon: Star, href: '/admin/reviews', badge: '5 flagged', badgeColor: 'bg-red-100 text-red-600' },
  ],
};

export default function AdminSidebar({ active, setActive, isMobileOpen, setIsMobileOpen }) {
  const pathname = usePathname();
  
  const getActiveFromPath = () => {
    if (pathname?.includes('/admin/overview')) return 'overview';
    if (pathname?.includes('/admin/analytics')) return 'analytics';
    if (pathname?.includes('/admin/patients')) return 'patients';
    if (pathname?.includes('/admin/doctors')) return 'doctors';
    if (pathname?.includes('/admin/reviews')) return 'reviews';
    return active || 'overview';
  };

  const currentActive = getActiveFromPath();

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-[#1a2e44]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-lg">O</div>
          <div>
            <p className="text-base font-bold text-white">FamilyHealth</p>
            <p className="text-[11px] font-semibold tracking-widest text-blue-300 uppercase">Admin Console</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 bg-blue-900/30 border border-blue-700/30 rounded-xl px-3 py-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-sm font-semibold text-blue-300">Staff Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {[
          { title: 'Main', items: adminNav.main },
          { title: 'People', items: adminNav.people },
          { title: 'Business', items: adminNav.business },
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
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
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
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">SA</div>
          <span className="text-sm font-semibold text-white">Admin</span>
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
        <button className="w-full flex items-center gap-2 text-xs text-blue-400 hover:text-white px-1 py-1 transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
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
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-lg">O</div>
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