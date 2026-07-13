// app/doctor/(protected)/queries/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronRight, Loader2, AlertCircle,
  Clock, CheckCircle, XCircle, MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function QueriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQueries();
  }, [page, statusFilter, search]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/doctor/queries?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch queries');
      }

      if (result.success) {
        setQueries(result.data.queries || []);
        setTotal(result.data.total || 0);
        setTotalPages(result.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast.error('Failed to load queries');
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
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D1B2A] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Queries</h1>
          <p className="text-gray-500 mt-1">{total} total queries</p>
        </div>
        <Link
          href="/doctor/raise-query"
          className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg hover:bg-[#1a2e44] transition"
        >
          <MessageCircle className="w-4 h-4" />
          Raise New Query
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search queries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] bg-white"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {queries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No queries found</h3>
            <p className="text-gray-500">You haven't raised any queries yet.</p>
            <Link
              href="/doctor/raise-query"
              className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg hover:bg-[#1a2e44] transition mt-4"
            >
              Raise Your First Query
            </Link>
          </div>
        ) : (
          queries.map((query) => (
            <div
              key={query._id}
              onClick={() => router.push(`/doctor/queries/${query._id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{query.subject}</h3>
                    {getPriorityBadge(query.priority)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{query.message}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Category: {query.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{query.age}</span>
                    {query.adminReply && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600">Has reply</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(query.status)}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400">Showing {queries.length} of {total} queries</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
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
  );
}