// app/admin/queries/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Search, ChevronRight, Loader2, AlertCircle,
  Clock, CheckCircle, XCircle, MessageCircle,
  Filter, ChevronDown, Eye, Reply
} from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminQueriesPage() {
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, [page, statusFilter, categoryFilter, priorityFilter, search]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/queries?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch queries');
      }

      if (result.success) {
        setQueries(result.data.queries || []);
        setTotal(result.data.total || 0);
        setTotalPages(result.data.totalPages || 1);
        setCounts(result.data.counts || {});
        setCategoryCounts(result.data.categoryCounts || {});
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      open: { icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Open' },
      in_progress: { icon: AlertCircle, color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'In Progress' },
      resolved: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Resolved' },
      closed: { icon: XCircle, color: 'text-gray-500 bg-gray-50 border-gray-200', label: 'Closed' },
    };
    const c = config[status] || config.open;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${c.color}`}>
        <Icon className="w-3 h-3" /> {c.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-50 text-blue-600',
      high: 'bg-amber-50 text-amber-600',
      urgent: 'bg-red-50 text-red-600',
    };
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config[priority] || config.low}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex">
        <AdminSidebar active="queries" setActive={() => {}} />
        <main className="pl-[260px] flex-1">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#0D1B2A] animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading queries...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex">
      <AdminSidebar active="queries" setActive={() => {}} />
      <main className="pl-[260px] flex-1">
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Queries</h1>
              <p className="text-gray-500 mt-1">
                {counts.open || 0} open · {counts.in_progress || 0} in progress · {counts.resolved || 0} resolved
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{counts.all || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-amber-500 font-medium">Open</p>
              <p className="text-2xl font-bold text-amber-500">{counts.open || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-blue-500 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-blue-500">{counts.in_progress || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-emerald-500 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-emerald-500">{counts.resolved || 0}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject, doctor name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open ({counts.open || 0})</option>
                  <option value="in_progress">In Progress ({counts.in_progress || 0})</option>
                  <option value="resolved">Resolved ({counts.resolved || 0})</option>
                  <option value="closed">Closed ({counts.closed || 0})</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] bg-white text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')} ({count})
                    </option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] bg-white text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Queries Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {queries.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                        No queries found
                      </td>
                    </tr>
                  ) : (
                    queries.map((query) => (
                      <tr key={query._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="max-w-[200px]">
                            <p className="text-sm font-semibold text-gray-900 truncate">{query.subject}</p>
                            <p className="text-xs text-gray-400 truncate">{query.message.slice(0, 60)}...</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">{query.doctorName}</p>
                            <p className="text-xs text-gray-400">{query.doctorEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                            {query.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getPriorityBadge(query.priority)}</td>
                        <td className="px-6 py-4">{getStatusBadge(query.status)}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">{new Date(query.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-400">{query.age}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/queries/${query._id}`}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/queries/${query._id}#reply`}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Reply className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-400">Showing {queries.length} of {total} queries</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}