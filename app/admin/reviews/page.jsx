'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

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

export default function AdminReviewsPage() {
  const [active, setActive] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [showFlagged, setShowFlagged] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ flagged: 0, published: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch reviews data
  const fetchReviews = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        search,
        status: statusFilter,
        rating: ratingFilter,
        showFlagged,
        page,
        limit: 10,
      });

      const response = await fetch(`/api/admin/reviews?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      if (result.success) {
        setReviews(result.data.reviews);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
        setStats(result.data.stats);
      } else {
        throw new Error(result.message || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, ratingFilter, showFlagged, page]);

  // Initial fetch
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchReviews();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, statusFilter, ratingFilter, showFlagged]);

  const handleRefresh = () => {
    fetchReviews(true);
  };

  const handleRetry = () => {
    fetchReviews();
  };

  const handleReviewAction = async (action, reviewIds) => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} review`);
      }

      if (result.success) {
        fetchReviews(true);
      } else {
        throw new Error(result.message || `Failed to ${action} review`);
      }
    } catch (error) {
      console.error(`Error ${action}ing reviews:`, error);
      alert(`Failed to ${action} review(s): ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getRatingNum = () => {
    if (ratingFilter === 'All Ratings') return null;
    return parseInt(ratingFilter);
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
              <p className="text-gray-600">Loading reviews...</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Reviews</h3>
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
          <span className="text-sm font-semibold text-gray-700">Reviews</span>
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

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Reviews</h1>
            <p className="text-sm mt-1">
              <span className="text-gray-400">{stats.published} published · </span>
              <span className="text-red-500 font-medium">{stats.flagged} flagged for moderation</span>
            </p>
          </div>

          {/* Flagged alert banner */}
          {stats.flagged > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-5">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Flag className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-700 flex-1">
                  {stats.flagged} reviews flagged — review and take action
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

          {/* Search + filters */}
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
            {reviews.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center text-sm text-gray-400">
                No reviews match your filters.
              </div>
            )}

            {reviews.map((r) => {
              const isFlagged = r.status === 'flagged';
              return (
                <div key={r.id}
                  className={`rounded-2xl border shadow-sm p-4 sm:p-6 transition-colors ${
                    isFlagged
                      ? 'bg-red-50 border-red-100'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  {/* Top row */}
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
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${r.patientColor?.startsWith('bg-') ? r.patientColor : ''}`}
                          style={(!r.patientColor?.startsWith('bg-') && r.patientColor) ? { backgroundColor: r.patientColor } : {}}
                        >
                          {r.patientInitials}
                        </div>
                        <span className="text-sm text-gray-600">{r.patientName}</span>
                      </div>

                      <span className="text-xs text-gray-400 hidden sm:inline">
                        · {new Date(r.date).toLocaleDateString()}
                      </span>

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

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      {isFlagged ? (
                        <>
                          <button
                            onClick={() => handleReviewAction('approve', [r.id])}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to remove this review?')) {
                                handleReviewAction('delete', [r.id]);
                              }
                            }}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReviewAction('flag', [r.id])}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                          >
                            <Flag className="w-3.5 h-3.5" /> Flag
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to remove this review?')) {
                                handleReviewAction('delete', [r.id]);
                              }
                            }}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mobile date */}
                  <div className="text-xs text-gray-400 sm:hidden mb-2">
                    {new Date(r.date).toLocaleDateString()}
                  </div>

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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-sm text-gray-400">
                Showing {reviews.length} of {total} reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Footer count */}
          {reviews.length > 0 && (
            <p className="text-center text-sm text-gray-400 mt-5">
              Showing {reviews.length} of {total} reviews
            </p>
          )}
        </div>
      </main>
    </div>
  );
}