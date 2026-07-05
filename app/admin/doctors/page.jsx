'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

/* ── Data ──────────────────────────────────────────────────── */
const doctors = [
  {
    id: 1,
    name: 'Dr. Priya Mehta',
    specialty: 'Cardiologist',
    city: 'Mumbai',
    mciNumber: 'MCI-2007-43281',
    rating: 4.9,
    reviews: 312,
    joined: '10 Jan 2026',
    status: 'verified',
    pending: false,
  },
  {
    id: 2,
    name: 'Dr. Arun Sharma',
    specialty: 'Diabetologist',
    city: 'Mumbai',
    mciNumber: 'MCI-MH-2004-91023',
    rating: 4.8,
    reviews: 487,
    joined: '5 Feb 2026',
    status: 'pending',
    pending: true,
  },
  {
    id: 3,
    name: 'Dr. Kavita Nair',
    specialty: 'Neurologist',
    city: 'Mumbai',
    mciNumber: 'MCI-KL-2011-55412',
    rating: 4.7,
    reviews: 203,
    joined: '12 Mar 2026',
    status: 'pending',
    pending: true,
  },
  {
    id: 4,
    name: 'Dr. Rajesh Kulkarni',
    specialty: 'Orthopedic',
    city: 'Mumbai',
    mciNumber: 'MCI-MH-2001-12345',
    rating: 4.9,
    reviews: 561,
    joined: '1 Apr 2026',
    status: 'pending',
    pending: true,
  },
  {
    id: 5,
    name: 'Dr. Arjun Mehta',
    specialty: 'Neurologist',
    city: 'Delhi',
    mciNumber: 'MCI-DI-2018-12345',
    rating: 4.9,
    reviews: 561,
    joined: '1 Apr 2026',
    status: 'pending',
    pending: true,
  },
  {
    id: 6,
    name: 'Dr. Sunita Patel',
    specialty: 'Gynecologist',
    city: 'Mumbai',
    mciNumber: 'MCI-GJ-2015-67890',
    rating: 4.6,
    reviews: 178,
    joined: '15 Mar 2026',
    status: 'verified',
    pending: false,
  },
];

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

/* ── Main ──────────────────────────────────────────────────── */
export default function AdminDoctorsPage() {
  const [active, setActive] = useState('doctors');
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      d.name.toLowerCase().includes(q) || 
      d.specialty.toLowerCase().includes(q) || 
      d.city.toLowerCase().includes(q) ||
      d.mciNumber.toLowerCase().includes(q);
    const matchSpecialty = specialtyFilter === 'All Specialties' || d.specialty === specialtyFilter;
    const matchStatus = statusFilter === 'All Status' || d.status === statusFilter;
    return matchSearch && matchSpecialty && matchStatus;
  });

  const pendingDoctors = doctors.filter(d => d.pending);
  const verifiedDoctors = doctors.filter(d => d.status === 'verified');

  const handleVerify = (doctor) => {
    alert(`✅ Doctor ${doctor.name} has been verified!`);
  };

  const handleReject = (doctor) => {
    alert(`❌ Doctor ${doctor.name} has been rejected.`);
  };

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
          <span className="text-sm font-semibold text-gray-700">Doctors</span>
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

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1200px] mx-auto">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Doctors</h1>
              <p className="text-sm text-gray-400 mt-1">
                {verifiedDoctors.length} verified · {pendingDoctors.length} pending verification
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Pending Alert Banner */}
          {pendingDoctors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      {pendingDoctors.length} doctors awaiting MCI registration verification
                    </p>
                    <p className="text-xs text-amber-600/80">
                      Verify against the Medical Council of India registry before approving
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

          {/* Search + filters - Responsive */}
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

          {/* Doctor Cards - Responsive */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-12 text-center text-gray-400 text-sm">
                No doctors match your filters.
              </div>
            )}

            {filtered.map((doctor) => (
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
                        <span className="font-mono">{doctor.mciNumber}</span>
                        <span>★ {doctor.rating} ({doctor.reviews} reviews)</span>
                        <span className="hidden sm:inline">Joined {doctor.joined}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status + Actions - Responsive */}
                  <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                    <StatusBadge status={doctor.status} />
                    
                    {doctor.pending ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVerify(doctor)}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(doctor)}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
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
                          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36">
                            {['View Profile', 'Edit Details', 'Suspend', 'Delete'].map((action) => (
                              <button
                                key={action}
                                onClick={() => setOpenMenuId(null)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                  action === 'Delete' ? 'text-red-500' : 'text-gray-700'
                                }`}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile joined date */}
                <div className="text-xs text-gray-400 sm:hidden mt-2">
                  Joined {doctor.joined}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
            <span>Showing {filtered.length} of {doctors.length} doctors</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {verifiedDoctors.length} verified
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {pendingDoctors.length} pending
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}