// app/patient/find-doctors/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Star,
  MapPin,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  BadgeCheck,
  Heart,
  Brain,
  Bone,
  Eye,
  Baby,
  Scissors,
  Stethoscope,
  Users,
  UserPlus,
  Filter,
  X,
  Loader2,
  AlertCircle,
  Navigation,
  AlertTriangle,
  Crown,
  Zap,
} from 'lucide-react';
import Sidebar from '@/components/patient-dashboard/Sidebar';
import Link from 'next/link';

const quickFilters = [
  'Diabetes', 'High Blood Pressure', 'Knee Pain',
  'Back Pain', 'Heart Disease', 'Eye Strain', 'Anxiety', 'Thyroid',
];

const specialties = [
  { label: 'All', icon: Stethoscope },
  { label: 'Cardiologist', icon: Heart },
  { label: 'Neurologist', icon: Brain },
  { label: 'Orthopedic', icon: Bone },
  { label: 'Eye Doctor', icon: Eye },
  { label: 'Pediatrician', icon: Baby },
  { label: 'Diabetologist', icon: Scissors },
  { label: 'Dermatologist', icon: Scissors },
];

const getColorClass = (hex) => {
  const colorMap = {
    '#EF4444': 'bg-red-500', '#F59E0B': 'bg-amber-500', '#10B981': 'bg-emerald-500',
    '#3B82F6': 'bg-blue-500', '#8B5CF6': 'bg-purple-500', '#EC4899': 'bg-pink-500',
    '#14B8A6': 'bg-teal-500', '#F97316': 'bg-orange-500', '#6366F1': 'bg-indigo-500',
    '#84CC16': 'bg-lime-500', '#06B6D4': 'bg-cyan-500', '#D946EF': 'bg-fuchsia-500',
    '#6B7280': 'bg-gray-500',
  };
  return colorMap[hex] || 'bg-gray-500';
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.floor(rating)
            ? 'text-amber-400 fill-amber-400'
            : s - 0.5 <= rating
              ? 'text-amber-400 fill-amber-200'
              : 'text-gray-200 fill-gray-200'
            }`}
        />
      ))}
    </div>
  );
}

export default function FindDoctorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const [hasAddress, setHasAddress] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Check if user has address
  useEffect(() => {
    checkUserAddress();
  }, []);

  const checkUserAddress = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        if (user?.address?.city || user?.address?.state || user?.address?.district) {
          setHasAddress(true);
          setUserLocation({
            city: user.address.city,
            district: user.address.district,
            state: user.address.state,
            pincode: user.address.pincode,
          });
        }
      }
    } catch (err) {
      console.error('Error checking address:', err);
    }
  };

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search,
        specialty: activeSpecialty,
        quickFilter: activeQuickFilter || '',
        page,
        limit: 10,
        sortBy,
        ...(userLocation && {
          city: userLocation.city,
          district: userLocation.district,
          state: userLocation.state,
        }),
      });

      const response = await fetch(`/api/patients/doctors?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch doctors');
      }

      if (result.success) {
        setDoctors(result.data.doctors);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        throw new Error(result.message || 'Failed to load doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, activeSpecialty, activeQuickFilter, page, sortBy, userLocation]);

  useEffect(() => {
    if (hasAddress) {
      fetchDoctors();
    } else {
      setLoading(false);
    }
  }, [fetchDoctors, hasAddress]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else if (hasAddress) {
        fetchDoctors();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, activeSpecialty, activeQuickFilter, hasAddress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Sidebar />
        <main className="md:pl-[280px]">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#0D1B2A] animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading doctors...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show address prompt if user hasn't added address
  if (!hasAddress) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Sidebar />
        <main className="md:pl-[280px]">
          <div className="max-w-3xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <Navigation className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                Add Your Location
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                To find doctors near you, please add your address in your profile settings.
                We'll match you with doctors in your city, district, or state.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1a2e44] transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Update Profile Address
                </Link>
                <p className="text-xs text-gray-400">
                  We only use your address to find nearby doctors
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Sidebar />

      <main className="md:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E40AF] text-xs font-bold rounded-full tracking-wider uppercase">
                <Users className="w-3.5 h-3.5" />
                Doctor Discovery
              </span>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mt-3 tracking-tight">
                Find the Right Doctor
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Doctors near you based on your location
              </p>
              {userLocation && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Showing doctors near {[userLocation.city, userLocation.district, userLocation.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <Stethoscope className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
                {total} doctors found
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by disease, doctor name, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white placeholder-gray-400 shadow-sm"
            />
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quickFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveQuickFilter(activeQuickFilter === f ? null : f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeQuickFilter === f
                  ? 'bg-[#0D1B2A] text-white border-[#0D1B2A] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Specialty tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide border-b border-gray-100">
            {specialties.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveSpecialty(label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all shrink-0 ${activeSpecialty === label
                  ? 'bg-[#0D1B2A] text-white border-[#0D1B2A] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Results row with filters */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{doctors.length}</span> doctors found
            </p>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
              >
                <option value="rating">Sort by Rating</option>
                <option value="fee">Sort by Fee (Low to High)</option>
                <option value="experience">Sort by Experience</option>
                <option value="distance">Sort by Distance</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* CTA banner */}
          <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1a2e44] rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-[15px]">Are you a doctor?</p>
                <p className="text-gray-400 text-sm mt-0.5">
                  List your practice and get more patients
                </p>
              </div>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm">
              Join Free →
            </button>
          </div>

          {/* Doctor cards */}
          <div className="space-y-4">
            {doctors.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-12 text-center text-gray-400 text-sm">
                No doctors match your search in your area.
              </div>
            )}

            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Avatar */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl ${getColorClass(doc.color)} flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0`}
                    >
                      {doc.initials}
                    </div>

                    {/* Info - Mobile */}
                    <div className="flex-1 min-w-0 md:hidden">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-[16px] font-semibold text-gray-900">{doc.name}</h3>
                        {doc.verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                        {/* ─── Plan Badge (Mobile) ─── */}
                        {doc.isPro && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                            doc.isPremium 
                              ? 'bg-amber-400 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {doc.isPremium ? 'Premium' : 'Pro'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{doc.specialty}</p>
                      <p className="text-sm text-gray-400">{doc.hospital}</p>
                    </div>
                  </div>

                  {/* Info - Desktop */}
                  <div className="flex-1 min-w-0 hidden md:block">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-[16px] font-semibold text-gray-900">{doc.name}</h3>
                          {doc.verified && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                          {/* ─── Plan Badge ─── */}
                          {doc.isPro && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                              doc.isPremium 
                                ? 'bg-amber-400 text-white' 
                                : 'bg-blue-500 text-white'
                            }`}>
                              {doc.isPremium ? 'Premium' : 'Pro'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{doc.specialty}</p>
                        <p className="text-sm text-gray-400">{doc.hospital}</p>
                        {doc.address && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[doc.address.city, doc.address.district, doc.address.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">₹{doc.fee}</p>
                        <p className="text-xs text-gray-400">per visit</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile fee */}
                <div className="md:hidden flex justify-end mt-2">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{doc.fee}</p>
                    <p className="text-xs text-gray-400">per visit</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={doc.rating} />
                    <span className="text-sm font-medium text-gray-700">{doc.rating}</span>
                    <span className="text-sm text-gray-400">({doc.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {doc.distance}
                  </div>
                  <span className="text-sm text-gray-500">{doc.experience}</span>
                </div>

                {/* Condition tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {doc.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {doc.languages.slice(0, 3).map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/find-doctors/${doc.id}`}
                    className="text-sm font-medium text-[#0D1B2A] hover:text-[#1a2e44] transition-colors flex items-center gap-1"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-400">
                Showing {doctors.length} of {total} doctors
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
        </div>
      </main>
    </div>
  );
}