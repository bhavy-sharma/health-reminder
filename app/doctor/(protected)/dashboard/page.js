"use client";

import Link from "next/link";
import { Bell, CheckCircle2, Zap, Calendar, Star, Eye, IndianRupee, ChevronRight, Check, User } from "lucide-react";

export default function DoctorDashboard() {
  return (
    <div className="p-8 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-[var(--color-navy)]">Doctor Portal</span>
        </div>
        <button className="relative p-2 text-[var(--color-navy)] hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-pulse-red)] rounded-full border-2 border-[var(--color-cream)]"></span>
        </button>
      </div>

      {/* Greeting Section */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-fraunces text-4xl font-bold text-[var(--color-navy)] mb-2 flex items-center gap-3">
            Good afternoon, Dr. Mehta <span className="text-3xl">👋</span>
          </h1>
          <p className="text-[var(--color-text-muted)]">Friday, 27 June 2026 · Mumbai</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#e6f4ef] text-[var(--color-sage-green)] px-3 py-1.5 rounded-full text-sm font-semibold border border-[var(--color-sage-green)]/20">
          <CheckCircle2 size={16} />
          Verified
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-[var(--color-navy)] rounded-[var(--radius-card-lg)] p-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 text-white shadow-[var(--shadow-medium)] border border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-warm-amber)]">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">You're on the Free Plan</h3>
            <p className="text-white/70 text-sm">8 / 10 bookings used this month. Upgrade for unlimited bookings + priority listing.</p>
          </div>
        </div>
        <Link href="/doctor/plans" className="bg-[var(--color-warm-amber)] text-[var(--color-navy)] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-opacity shrink-0 flex items-center gap-2">
          Upgrade to Pro
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 */}
        <Link href="/doctor/appointments" className="block bg-white rounded-[var(--radius-card-md)] p-5 border border-[var(--color-border)] shadow-[var(--shadow-subtle)] hover:shadow-md hover:border-[var(--color-navy)] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--color-navy)] group-hover:bg-[var(--color-navy)] group-hover:text-white transition-colors">
              <Calendar size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-sage-green)] bg-[#e6f4ef] px-2 py-1 rounded-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              +1
            </span>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[var(--color-navy)] mb-1">3</div>
          <p className="text-[var(--color-text-secondary)] font-medium text-sm mb-1">Today's Patients</p>
          <p className="text-[var(--color-text-muted)] text-xs">2 confirmed · 1 pending</p>
        </Link>

        {/* Stat 2 */}
        <Link href="/doctor/reviews" className="block bg-white rounded-[var(--radius-card-md)] p-5 border border-[var(--color-border)] shadow-[var(--shadow-subtle)] hover:shadow-md hover:border-[var(--color-navy)] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-fill)] flex items-center justify-center text-[var(--color-warm-amber)] group-hover:bg-[var(--color-warm-amber)] group-hover:text-white transition-colors">
              <Star size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-sage-green)] bg-[#e6f4ef] px-2 py-1 rounded-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              +0.1
            </span>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[var(--color-navy)] mb-1">4.9</div>
          <p className="text-[var(--color-text-secondary)] font-medium text-sm mb-1">Avg Rating</p>
          <p className="text-[var(--color-text-muted)] text-xs">312 total reviews</p>
        </Link>

        {/* Stat 3 */}
        <div className="bg-white rounded-[var(--radius-card-md)] p-5 border border-[var(--color-border)] shadow-[var(--shadow-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--color-sage-green)]">
              <Eye size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-sage-green)] bg-[#e6f4ef] px-2 py-1 rounded-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              +18%
            </span>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[var(--color-navy)] mb-1">1,240</div>
          <p className="text-[var(--color-text-secondary)] font-medium text-sm mb-1">Profile Views</p>
          <p className="text-[var(--color-text-muted)] text-xs">This month</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-[var(--radius-card-md)] p-5 border border-[var(--color-border)] shadow-[var(--shadow-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[var(--color-pulse-red)]">
              <IndianRupee size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-sage-green)] bg-[#e6f4ef] px-2 py-1 rounded-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              +12%
            </span>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[var(--color-navy)] mb-1">₹32k</div>
          <p className="text-[var(--color-text-secondary)] font-medium text-sm mb-1">Monthly Revenue</p>
          <p className="text-[var(--color-text-muted)] text-xs">40 consultations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-fraunces text-2xl font-bold text-[var(--color-navy)]">Today's Schedule</h2>
            <Link href="/doctor/appointments" className="text-[var(--color-sage-green)] text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4a9e7f] text-white flex items-center justify-center font-bold">RS</div>
                <div>
                  <h4 className="font-bold text-[var(--color-navy)]">Ramesh Sharma</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">62 yrs · Chest Pain Follow-up</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[var(--color-navy)] text-sm">4:30 PM</div>
                <div className="flex items-center justify-end gap-1 text-xs text-[var(--color-sage-green)] font-medium mt-0.5">
                  <Check size={14} /> Confirmed
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#e9a84c] text-white flex items-center justify-center font-bold">AK</div>
                <div>
                  <h4 className="font-bold text-[var(--color-navy)]">Anita Kulkarni</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">45 yrs · BP Management</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[var(--color-navy)] text-sm">5:00 PM</div>
                <div className="flex items-center justify-end gap-1 text-xs text-[var(--color-sage-green)] font-medium mt-0.5">
                  <Check size={14} /> Confirmed
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#e8403a] text-white flex items-center justify-center font-bold">VP</div>
                <div>
                  <h4 className="font-bold text-[var(--color-navy)]">Vijay Patel</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">55 yrs · Post Angioplasty Check</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[var(--color-navy)] text-sm">5:30 PM</div>
                <div className="flex items-center justify-end gap-1 text-xs text-[var(--color-warm-amber)] font-medium mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                  Pending
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-[var(--color-border)]">
               <Link href="/doctor/appointments" className="w-full bg-[var(--color-navy)] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2">
                 <Calendar size={16} /> Manage All Appointments
               </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="font-fraunces text-2xl font-bold text-[var(--color-navy)]">Recent Activity</h2>
          
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-[var(--shadow-subtle)] p-5">
            <div className="relative pl-6 pb-6 border-l-2 border-gray-100 last:border-0 last:pb-0">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--color-success-fill)] border-2 border-[var(--color-sage-green)]"></div>
              <p className="text-sm text-[var(--color-navy)] font-medium">Sunita Rao booked Tomorrow, 10:00 AM</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">5 min ago</p>
            </div>
            <div className="relative pl-6 pb-6 border-l-2 border-gray-100 last:border-0 last:pb-0">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--color-warning-fill)] border-2 border-[var(--color-warm-amber)]"></div>
              <p className="text-sm text-[var(--color-navy)] font-medium">Ramesh Sharma left a 5-star review</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">1 hr ago</p>
            </div>
            <div className="relative pl-6 last:border-0 last:pb-0">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--color-danger-fill)] border-2 border-[var(--color-pulse-red)]"></div>
              <p className="text-sm text-[var(--color-navy)] font-medium">Deepak Mehta cancelled Today, 3:00 PM</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">2 hrs ago</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Reviews (Bottom Section) */}
      <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-fraunces text-2xl font-bold text-[var(--color-navy)]">Recent Reviews</h2>
          <Link href="/doctor/reviews" className="text-[var(--color-sage-green)] text-sm font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[var(--radius-card-md)] p-5 border border-[var(--color-border)] shadow-[var(--shadow-subtle)]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4a9e7f] text-white flex items-center justify-center font-bold text-sm">RS</div>
                <div>
                  <h4 className="font-bold text-[var(--color-navy)] text-sm">Ramesh S.</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">2 days ago</p>
                </div>
              </div>
              <div className="flex text-[var(--color-warm-amber)]">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Excellent doctor. Explained everything clearly. Very patient and thorough.
            </p>
          </div>

          <div className="bg-white rounded-[var(--radius-card-md)] p-5 border border-[var(--color-border)] shadow-[var(--shadow-subtle)]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e9a84c] text-white flex items-center justify-center font-bold text-sm">AK</div>
                <div>
                  <h4 className="font-bold text-[var(--color-navy)] text-sm">Anita K.</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">1 week ago</p>
                </div>
              </div>
              <div className="flex text-[var(--color-warm-amber)]">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              My father has been her patient for 3 years. Always available on WhatsApp.
            </p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/doctor/profile" className="bg-white rounded-[var(--radius-card-md)] p-4 border border-[var(--color-border)] hover:border-[var(--color-navy)] transition-colors group">
            <div className="text-[var(--color-navy)] mb-2"><User size={24} /></div>
            <h4 className="font-bold text-[var(--color-navy)] text-sm">Edit Profile</h4>
            <p className="text-xs text-[var(--color-text-muted)]">Update your info</p>
            <div className="mt-3 text-[var(--color-sage-green)] opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </div>
          </Link>
          <Link href="/doctor/reviews" className="bg-white rounded-[var(--radius-card-md)] p-4 border border-[var(--color-border)] hover:border-[var(--color-navy)] transition-colors group">
            <div className="text-[var(--color-warm-amber)] mb-2"><Star size={24} fill="currentColor" /></div>
            <h4 className="font-bold text-[var(--color-navy)] text-sm">All Reviews</h4>
            <p className="text-xs text-[var(--color-text-muted)]">Reply to patients</p>
            <div className="mt-3 text-[var(--color-warm-amber)] opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </div>
          </Link>
          <Link href="/doctor/appointments" className="bg-white rounded-[var(--radius-card-md)] p-4 border border-[var(--color-border)] hover:border-[var(--color-navy)] transition-colors group">
            <div className="text-[#6c5ce7] mb-2"><Calendar size={24} /></div>
            <h4 className="font-bold text-[var(--color-navy)] text-sm">Appointments</h4>
            <p className="text-xs text-[var(--color-text-muted)]">Manage schedule</p>
            <div className="mt-3 text-[var(--color-navy)] opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </div>
          </Link>
          <Link href="/doctor/plans" className="bg-white rounded-[var(--radius-card-md)] p-4 border border-[var(--color-border)] hover:border-[var(--color-navy)] transition-colors group">
            <div className="text-[var(--color-pulse-red)] mb-2"><Zap size={24} fill="currentColor" /></div>
            <h4 className="font-bold text-[var(--color-navy)] text-sm">Plans</h4>
            <p className="text-xs text-[var(--color-text-muted)]">Upgrade for more</p>
            <div className="mt-3 text-[var(--color-pulse-red)] opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
