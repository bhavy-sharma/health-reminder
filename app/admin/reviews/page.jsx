'use client';

import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  ShieldCheck,
  Search,
  ChevronDown,
  Flag,
  Trash2,
  CheckCircle,
  Menu,
  Star,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

/* ── Data ──────────────────────────────────────────────────── */
const initialReviews = [
  {
    id: 1,
    doctorInitials: 'PM', doctorColor: 'bg-red-500',    doctorName: 'Dr. Priya Mehta',
    patientInitials:'RS', patientColor:'bg-emerald-500', patientName: 'Ramesh S.',
    date: '25 Jun 2026', rating: 5, status: 'published',
    text: 'Excellent doctor. Explained everything clearly about my heart condition. Very patient.',
  },
  {
    id: 2,
    doctorInitials: 'AS', doctorColor: 'bg-teal-600',   doctorName: 'Dr. Arun Sharma',
    patientInitials:'SM', patientColor:'bg-emerald-700', patientName: 'Sunita M.',
    date: '24 Jun 2026', rating: 4, status: 'published',
    text: "Changed my life! My HbA1c was 11.2, now it's 6.8. Explains diet in simple Hindi.",
  },
  {
    id: 3,
    doctorInitials: 'KN', doctorColor: 'bg-amber-500',  doctorName: 'Dr. Kavita Nair',
    patientInitials:'TA', patientColor:'bg-amber-400',   patientName: 'Thomas A.',
    date: '22 Jun 2026', rating: 4, status: 'published',
    text: "My mother had a stroke and Dr. Nair's care was exceptional. She was available 24/7.",
  },
  {
    id: 4,
    doctorInitials: 'RK', doctorColor: 'bg-gray-800',   doctorName: 'Dr. Rajesh Kulkarni',
    patientInitials:'NP', patientColor:'bg-pink-500',    patientName: 'Nalini P.',
    date: '20 Jun 2026', rating: 1, status: 'flagged',
    text: 'TOTAL FRAUD! This doctor is fake and took money without seeing me properly. AVOID!',
  },
  {
    id: 5,
    doctorInitials: 'SK', doctorColor: 'bg-purple-600', doctorName: 'Dr. Sneha Kulkarni',
    patientInitials:'VP', patientColor:'bg-red-500',     patientName: 'Vijay P.',
    date: '19 Jun 2026', rating: 1, status: 'flagged',
    text: 'Waited 2 hours past appointment time. No apology. Will never return.',
  },
  {
    id: 6,
    doctorInitials: 'KS', doctorColor: 'bg-emerald-600',doctorName: 'Dr. Kavya Singh',
    patientInitials:'AR', patientColor:'bg-blue-500',    patientName: 'Arjun R.',
    date: '18 Jun 2026', rating: 2, status: 'flagged',
    text: 'Prescribed medicine without proper examination. Felt very rushed.',
  },
];

const statusOptions = ['All Status', 'published', 'flagged'];
const ratingOptions = ['All Ratings', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

function StarRow({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export default function AdminReviewsPage() {
  const [active, setActive] = useState('reviews');
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [showFlagged, setShowFlagged] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const flaggedCount = reviews.filter((r) => r.status === 'flagged').length;
  const publishedCount = reviews.filter((r) => r.status === 'published').length;

  const removeReview = (id) => setReviews((prev) => prev.filter((r) => r.id !== id));
  const approveReview = (id) => setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: 'published' } : r));

  const ratingNum = ratingFilter === 'All Ratings' ? null : parseInt(ratingFilter);

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.doctorName.toLowerCase().includes(q) || r.patientName.toLowerCase().includes(q) || r.text.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All Status' || r.status === statusFilter;
    const matchRating = !ratingNum || r.rating === ratingNum;
    const matchFlagged = !showFlagged || r.status === 'flagged';
    return matchSearch && matchStatus && matchRating && matchFlagged;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex">
      <AdminSidebar 
        active={active} 
        setActive={setActive} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 w-full md:pl-[260px]">
        {/* Topbar with mobile menu */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center gap-2">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-400 hidden sm:inline">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
          <span className="text-sm font-semibold text-gray-700">Reviews</span>
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

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Reviews</h1>
            <p className="text-sm mt-1">
              <span className="text-gray-400">{publishedCount} published · </span>
              <span className="text-red-500 font-medium">{flaggedCount} flagged for moderation</span>
            </p>
          </div>

          {/* Flagged alert banner */}
          {flaggedCount > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-5">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Flag className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-700 flex-1">
                  {flaggedCount} reviews flagged — review and take action
                </p>
              </div>
              <button
                onClick={() => { setShowFlagged(!showFlagged); setStatusFilter('All Status'); }}
                className="text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors w-full sm:w-auto text-center"
              >
                {showFlagged ? 'Show All' : 'Show Flagged'}
              </button>
            </div>
          )}

          {/* Search + filters - Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctor, patient, or review text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
              />
            </div>

            <div className="flex gap-3">
              {[
                { value: statusFilter, setter: setStatusFilter, opts: statusOptions },
                { value: ratingFilter, setter: setRatingFilter, opts: ratingOptions },
              ].map(({ value, setter, opts }, i) => (
                <div key={i} className="relative flex-1 sm:flex-initial">
                  <select
                    value={value}
                    onChange={(e) => { setter(e.target.value); setShowFlagged(false); }}
                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer w-full"
                  >
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center text-sm text-gray-400">
                No reviews match your filters.
              </div>
            )}

            {filtered.map((r) => {
              const isFlagged = r.status === 'flagged';
              return (
                <div key={r.id}
                  className={`rounded-2xl border shadow-sm p-4 sm:p-6 transition-colors ${
                    isFlagged
                      ? 'bg-red-50 border-red-100'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  {/* Top row - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Doctor */}
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${r.doctorColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {r.doctorInitials}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{r.doctorName}</span>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />

                      {/* Patient */}
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${r.patientColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {r.patientInitials}
                        </div>
                        <span className="text-sm text-gray-600">{r.patientName}</span>
                      </div>

                      <span className="text-xs text-gray-400 hidden sm:inline">· {r.date}</span>

                      {/* Status badge */}
                      {isFlagged ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-white border border-red-200 rounded-full px-2.5 py-0.5">
                          <Flag className="w-3 h-3" /> Flagged
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
                          Published
                        </span>
                      )}
                    </div>

                    {/* Actions - Responsive */}
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      {isFlagged ? (
                        <>
                          <button
                            onClick={() => approveReview(r.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => removeReview(r.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-amber-600 transition-colors">
                            <Flag className="w-3.5 h-3.5" /> Flag
                          </button>
                          <button
                            onClick={() => removeReview(r.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mobile date */}
                  <div className="text-xs text-gray-400 sm:hidden mb-2">{r.date}</div>

                  {/* Stars */}
                  <StarRow rating={r.rating} />

                  {/* Review text */}
                  <p className={`mt-2 text-sm leading-relaxed ${isFlagged ? 'text-red-800' : 'text-gray-700'}`}>
                    {r.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer count */}
          {filtered.length > 0 && (
            <p className="text-center text-sm text-gray-400 mt-5">
              Showing {filtered.length} of {reviews.length} reviews
            </p>
          )}
        </div>
      </main>
    </div>
  );
}