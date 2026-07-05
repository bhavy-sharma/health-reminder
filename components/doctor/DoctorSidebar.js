"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calendar, Star, User, CreditCard, LogOut, ArrowLeft } from "lucide-react";

export default function DoctorSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/doctor/dashboard", icon: LayoutGrid },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar, badge: 4 },
    { name: "Reviews", href: "/doctor/reviews", icon: Star },
    { name: "Edit Profile", href: "/doctor/profile", icon: User },
    { name: "Plans & Billing", href: "/doctor/plans", icon: CreditCard },
  ];

  return (
    <aside className="w-64 h-screen bg-[var(--color-doctor-sidebar)] text-white fixed left-0 top-0 flex flex-col border-r border-white/5 z-50">
      {/* Logo */}
      <div className="p-6 pb-8">
        <Link href="/" className="block w-fit">
          <h1 className="font-fraunces text-2xl font-bold hover:text-white/90 transition-colors">Family Health<span className="text-white">●</span></h1>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="px-4 mb-6">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-pulse-red)] flex items-center justify-center font-bold text-sm shrink-0">
            PM
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-bold text-sm truncate">Dr. Priya Mehta</h3>
            <p className="text-white/50 text-xs truncate mb-2">Cardiologist · Apollo, ...</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-warm-amber)]">
                <Star size={12} fill="currentColor" /> 4.9 <span className="text-white/50">(312)</span>
              </div>
              <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-white/80">Free Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/doctor');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium
                ${isActive 
                  ? "bg-[var(--color-doctor-sidebar-active)] text-white" 
                  : "text-[var(--color-doctor-sidebar-text)] hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="bg-[var(--color-pulse-red)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-4">
        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-white/10 to-transparent rounded-2xl p-4 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-warm-amber)] mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22 12 2l10 20-10-4z"/></svg>
            <span className="font-bold text-sm">Go Premium</span>
          </div>
          <p className="text-white/50 text-xs mb-3 pr-4 leading-relaxed">
            3x more bookings + top search placement
          </p>
          <Link href="/doctor/plans" className="block text-center w-full bg-[var(--color-warm-amber)] text-[var(--color-navy)] text-sm font-bold py-2 rounded-lg hover:bg-opacity-90 transition-opacity">
            Upgrade Now
          </Link>
        </div>

        <div className="space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-xs text-[var(--color-doctor-sidebar-text)] hover:text-white transition-colors">
            <ArrowLeft size={14} />
            View patient side
          </Link>
          <button 
            onClick={async () => {
              await fetch('/api/doctor/auth/logout', { method: 'POST' });
              window.location.href = '/doctor';
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[var(--color-doctor-sidebar-text)] hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
