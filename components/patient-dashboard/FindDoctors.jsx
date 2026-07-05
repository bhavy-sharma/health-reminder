'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Sidebar from './Sidebar';

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
    '#EF4444': 'bg-red-500',
    '#F59E0B': 'bg-amber-500',
    '#10B981': 'bg-emerald-500',
    '#3B82F6': 'bg-blue-500',
    '#8B5CF6': 'bg-purple-500',
    '#EC4899': 'bg-pink-500',
    '#14B8A6': 'bg-teal-500',
    '#F97316': 'bg-orange-500',
    '#6366F1': 'bg-indigo-500',
    '#84CC16': 'bg-lime-500',
    '#06B6D4': 'bg-cyan-500',
    '#D946EF': 'bg-fuchsia-500',
    '#6B7280': 'bg-gray-500',
  };
  return colorMap[hex] || 'bg-gray-500';
};

const doctors = [
  {
    id: 1,
    name: 'Dr. Priya Mehta',
    initials: 'PM',
    color: '#EF4444',
    specialty: 'Cardiologist & Interventional',
    hospital: 'Apollo Hospitals, Bandra',
    rating: 4.9,
    reviews: 312,
    distance: '1.2 km',
    experience: '18 yrs exp',
    nextSlot: 'Next: Today, 4:30 PM',
    tags: ['Heart Disease', 'High Blood Pressure', 'Chest Pain', '+1 more'],
    languages: ['Hindi', 'English'],
    fee: 800,
    verified: true,
  },
  {
    id: 2,
    name: 'Dr. Arun Sharma',
    initials: 'AS',
    color: '#14B8A6',
    specialty: 'Diabetologist & Endocrinologist',
    hospital: 'Lilavati Hospital, Bandra',
    rating: 4.7,
    reviews: 198,
    distance: '2.4 km',
    experience: '14 yrs exp',
    nextSlot: 'Next: Tomorrow, 10:00 AM',
    tags: ['Diabetes', 'Thyroid', 'Obesity'],
    languages: ['Hindi', 'Marathi', 'English'],
    fee: 700,
    verified: true,
  },
  {
    id: 3,
    name: 'Dr. Sneha Kulkarni',
    initials: 'SK',
    color: '#8B5CF6',
    specialty: 'Neurologist',
    hospital: 'Kokilaben Hospital, Andheri',
    rating: 4.8,
    reviews: 245,
    distance: '3.1 km',
    experience: '20 yrs exp',
    nextSlot: 'Next: Today, 6:00 PM',
    tags: ['Migraine', 'Epilepsy', 'Back Pain'],
    languages: ['English', 'Marathi'],
    fee: 1200,
    verified: true,
  },
  {
    id: 4,
    name: 'Dr. Rajesh Patel',
    initials: 'RP',
    color: '#3B82F6',
    specialty: 'Orthopedic Surgeon',
    hospital: 'Breach Candy Hospital',
    rating: 4.6,
    reviews: 176,
    distance: '4.5 km',
    experience: '22 yrs exp',
    nextSlot: 'Next: Wed, 11:30 AM',
    tags: ['Knee Pain', 'Joint Replacement', 'Spine'],
    languages: ['Hindi', 'Gujarati', 'English'],
    fee: 900,
    verified: true,
  },
  {
    id: 5,
    name: 'Dr. Ananya Iyer',
    initials: 'AI',
    color: '#F59E0B',
    specialty: 'Pediatrician',
    hospital: 'Hinduja Hospital, Mahim',
    rating: 4.9,
    reviews: 403,
    distance: '1.8 km',
    experience: '12 yrs exp',
    nextSlot: 'Next: Today, 5:15 PM',
    tags: ['Child Care', 'Vaccination', 'Nutrition'],
    languages: ['English', 'Tamil', 'Hindi'],
    fee: 600,
    verified: true,
  },
  {
    id: 6,
    name: 'Dr. Kavya Reddy',
    initials: 'KR',
    color: '#EC4899',
    specialty: 'Ophthalmologist',
    hospital: 'Eye Care Centre, Juhu',
    rating: 4.7,
    reviews: 134,
    distance: '2.9 km',
    experience: '10 yrs exp',
    nextSlot: 'Next: Thu, 9:00 AM',
    tags: ['Eye Strain', 'Cataract', 'Glaucoma'],
    languages: ['English', 'Telugu'],
    fee: 750,
    verified: true,
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.floor(rating)
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
  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = doctors.filter((d) => {
    const matchSearch =
      search === '' ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty =
      activeSpecialty === 'All' ||
      d.specialty.toLowerCase().includes(activeSpecialty.toLowerCase());
    const matchQuick =
      !activeQuickFilter ||
      d.tags.some((t) => t.toLowerCase().includes(activeQuickFilter.toLowerCase()));
    return matchSearch && matchSpecialty && matchQuick;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Sidebar />

      <main className="md:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10">

          {/* Header with Category Label */}
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
                Best doctors near you, matched to your health condition
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <Stethoscope className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
                {filtered.length} doctors found
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeQuickFilter === f
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all shrink-0 ${
                  activeSpecialty === label
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
              <span className="font-semibold text-gray-900">{filtered.length}</span> doctors found
            </p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
                Relevance <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* CTA banner - Redesigned to match other pages */}
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

          {/* Doctor cards - Enhanced styling */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-12 text-center text-gray-400 text-sm">
                No doctors match your search.
              </div>
            )}

            {filtered.map((doc) => (
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

                    {/* Info - Mobile friendly */}
                    <div className="flex-1 min-w-0 md:hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-[16px] font-semibold text-gray-900">{doc.name}</h3>
                        {doc.verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
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
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[16px] font-semibold text-gray-900">{doc.name}</h3>
                          {doc.verified && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{doc.specialty}</p>
                        <p className="text-sm text-gray-400">{doc.hospital}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">₹{doc.fee}</p>
                        <p className="text-xs text-gray-400">per visit</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile fee display */}
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

                {/* Next slot */}
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">{doc.nextSlot}</span>
                </div>

                {/* Condition tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {doc.tags.map((tag) => (
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
                    {doc.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                  <button className="text-sm font-medium text-[#0D1B2A] hover:text-[#1a2e44] transition-colors flex items-center gap-1">
                    View Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}