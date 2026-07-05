// app/admin/doctors/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  ChevronRight,
  ShieldCheck,
  Download,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  Shield,
  Check,
  X,
  Menu,
  RefreshCw,
  AlertCircle,
  Eye,
  UserX,
  UserCheck,
  Trash2,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';
import { useRouter } from 'next/navigation';

const specialtyOptions = ['All Specialties', 'Cardiologist', 'Diabetologist', 'Neurologist', 'Orthopedic', 'Gynecologist', 'Pediatrician'];
const statusOptions = ['All Status', 'verified', 'pending'];

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-1 text-sm text-gray-600">
      <span className="text-amber-400">★</span>
      {rating}
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle className="w-3.5 h-3.5" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [active, setActive] = useState('doctors');
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ verified: 0, pending: 0 });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch doctors data
  const fetchDoctors = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        search,
        specialty: specialtyFilter,
        status: statusFilter,
        page,
        limit: 10,
      });

      const response = await fetch(`/api/admin/doctors?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch doctors');
      }

      if (result.success) {
        setDoctors(result.data.doctors);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
        setStats(result.data.stats);
      } else {
        throw new Error(result.message || 'Failed to load doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError(error.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, specialtyFilter, statusFilter, page]);

  // Initial fetch
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchDoctors();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, specialtyFilter, statusFilter]);

  const handleRefresh = () => {
    fetchDoctors(true);
  };

  const handleRetry = () => {
    fetchDoctors();
  };

  const handleViewDoctor = (doctorId) => {
    router.push(`/admin/doctors/${doctorId}`);
  };

  const handleDoctorAction = async (action, doctorIds, reason = '') => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, doctorIds, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} doctor`);
      }

      if (result.success) {
        fetchDoctors(true);
        setOpenMenuId(null);
      } else {
        throw new Error(result.message || `Failed to ${action} doctor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing doctors:`, error);
      alert(`Failed to ${action} doctor(s): ${error.message}`);
    } finally {
      setActionLoading(false);
    }
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
              <p className="text-gray-600">Loading doctors...</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Doctors</h3>
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
          <span className="text-sm font-semibold text-gray-700">Doctors</span>
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
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">SA</div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1200px] mx-auto">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Doctors</h1>
              <p className="text-sm text-gray-400 mt-1">
                {stats.verified} verified · {stats.pending} pending verification
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Pending Alert Banner */}
          {stats.pending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      {stats.pending} doctors awaiting verification
                    </p>
                    <p className="text-xs text-amber-600/80">
                      Verify doctors before they can start practicing on the platform
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setStatusFilter('pending')}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors w-full sm:w-auto text-center"
                >
                  View Pending →
                </button>
              </div>
            </div>
          )}

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctor, specialty or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer flex-1 sm:flex-initial"
              >
                {specialtyOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer flex-1 sm:flex-initial"
              >
                {statusOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="space-y-3">
            {doctors.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-12 text-center text-gray-400 text-sm">
                No doctors match your filters.
              </div>
            )}

            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Doctor Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{doctor.name}</h3>
                        <span className="text-xs text-gray-400 truncate">{doctor.specialty} · {doctor.city}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                        <span className="font-mono">{doctor.medicalRegNo}</span>
                        <span>★ {doctor.rating} ({doctor.reviews} reviews)</span>
                        <span className="hidden sm:inline">Joined {new Date(doctor.joined).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status + Actions */}
                  <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                    <StatusBadge status={doctor.status} />
                    
                    {doctor.pending ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDoctorAction('verify', [doctor.id])}
                          disabled={actionLoading}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Accept</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to reject ${doctor.name}?`)) {
                              handleDoctorAction('reject', [doctor.id]);
                            }
                          }}
                          disabled={actionLoading}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === doctor.id ? null : doctor.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        {openMenuId === doctor.id && (
                          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleViewDoctor(doctor.id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> View Profile
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                const reason = prompt('Enter suspension reason:');
                                if (reason && reason.trim()) {
                                  handleDoctorAction('suspend', [doctor.id], reason);
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <UserX className="w-4 h-4" /> Suspend
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDoctorAction('unsuspend', [doctor.id]);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" /> Unsuspend
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                if (confirm(`Are you sure you want to delete ${doctor.name}?`)) {
                                  handleDoctorAction('delete', [doctor.id]);
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile joined date */}
                <div className="text-xs text-gray-400 sm:hidden mt-2">
                  Joined {new Date(doctor.joined).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
              <span>Showing {doctors.length} of {total} doctors</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Footer Stats */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
            <span>Showing {doctors.length} of {total} doctors</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {stats.verified} verified
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {stats.pending} pending
              </span>
            </div>
          </div>

          {/* Last updated */}
          <div className="text-center text-xs text-gray-400 py-2">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}