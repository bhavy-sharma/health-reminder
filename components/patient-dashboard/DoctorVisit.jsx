'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Share2,
  MessageCircle,
  Check,
  User,
  Calendar,
  Clock,
  Stethoscope,
  AlertCircle,
  Loader2,
  ChevronRight,
  Users,
  Pill,
  HeartPulse,
  Clipboard,
} from 'lucide-react';
import Sidebar from './Sidebar';

const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

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

const specialties = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology',
  'Pediatrics', 'General Medicine', 'Ophthalmology', 'Endocrinology',
];

const includeItems = [
  { id: 'medicines',    label: 'Current medicines list',  recommended: true,  defaultChecked: true  },
  { id: 'allergies',   label: 'Known allergies',          recommended: true,  defaultChecked: true  },
  { id: 'lab3',        label: 'Last 3 lab reports',       recommended: true,  defaultChecked: true  },
  { id: 'prescription',label: 'Last prescription',        recommended: true,  defaultChecked: true  },
  { id: 'fullreport',  label: 'Complete report history',  recommended: false, defaultChecked: false },
  { id: 'vaccination', label: 'Vaccination records',      recommended: false, defaultChecked: false },
  { id: 'docnotes',    label: 'Previous doctor notes',    recommended: false, defaultChecked: false },
];

export default function DoctorVisitPrepPage() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [reason, setReason] = useState('');
  const [generating, setGenerating] = useState(false);
  const [checked, setChecked] = useState(
    Object.fromEntries(includeItems.map((i) => [i.id, i.defaultChecked]))
  );

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        setLoading(true);
        const profileRes = await fetch('/api/user/profile');
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();
        const familyId = profileData.user?.activeFamilyId?._id || profileData.user?.activeFamilyId;

        if (familyId) {
          const membersRes = await fetch(`/api/family/members?familyId=${familyId}`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            const members = membersData.members || [];
            setFamilyMembers(members);
            if (members.length > 0) {
              setSelectedMember(members[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching family data:', err);
        setError('Failed to load family members');
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyData();
  }, []);

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleGeneratePDF = async () => {
    setGenerating(true);
    // Simulate PDF generation
    setTimeout(() => {
      setGenerating(false);
      // In production, this would call an API to generate the PDF
      alert('PDF generation would happen here!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Sidebar />

      <main className="md:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10">

          {/* Header with Category Label */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E40AF] text-xs font-bold rounded-full tracking-wider uppercase">
                <Clipboard className="w-3.5 h-3.5" />
                Doctor Visit Prep
              </span>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mt-3 tracking-tight">
                Prepare for Doctor Visit
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Generate a comprehensive health summary PDF for your next consultation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <Stethoscope className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
                Health Summary
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

            {/* ── Left column ── */}
            <div className="space-y-6">

              {/* Step 1: Select Family Member */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-serif font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="bg-[#0D1B2A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Select who's visiting the doctor
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {loading && <div className="col-span-full py-4 text-center text-sm text-gray-500">Loading family members...</div>}
                  {error && <div className="col-span-full py-4 text-center text-sm text-red-500">{error}</div>}
                  {!loading && !error && familyMembers.length === 0 && (
                    <div className="col-span-full py-4 text-center text-sm text-gray-500">No family members found.</div>
                  )}
                  {familyMembers.map((m) => {
                    const active = selectedMember?._id === m._id;
                    const initials = m.name ? m.name.charAt(0).toUpperCase() : '?';
                    return (
                      <button
                        key={m._id}
                        onClick={() => setSelectedMember(m)}
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 py-5 transition-all ${
                          active
                            ? 'border-[#0D1B2A] bg-[#FAF8F5] shadow-md'
                            : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-full ${getColorClass(m.avatarColor || '#6B7280')} flex items-center justify-center text-white text-xl font-bold shadow-sm`}>
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{m.name}</span>
                        {active && (
                          <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#0D1B2A] rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 2: Visit Details */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-serif font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="bg-[#0D1B2A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Visit details
                </h2>
                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Sharma"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialty *</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    >
                      {specialties.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                      <input
                        type="time"
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for visit</label>
                    <textarea
                      rows={3}
                      placeholder="Describe symptoms or reason for consultation..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>
              </section>



            </div>

            {/* ── Right column — Preview & Actions ── */}
            <div className="lg:sticky lg:top-10 space-y-4">
              
              {/* Preview Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Preview Summary
                </h3>

                <div className="bg-[#FAF8F5] rounded-xl border border-gray-100 p-5">
                  {!selectedMember ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Select a family member to view their health summary.
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <div className={`w-16 h-16 rounded-full ${getColorClass(selectedMember.avatarColor || '#6B7280')} flex items-center justify-center text-white text-2xl font-bold shadow-sm mx-auto mb-2`}>
                          {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <p className="text-lg font-serif font-bold text-gray-900">
                          {selectedMember.name.replace(' (You)', '')}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {calculateAge(selectedMember.dateOfBirth)} years • {selectedMember.bloodGroup || 'N/A'}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Blood Group:</span>
                          <span className="font-semibold text-gray-900">{selectedMember.bloodGroup || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Age:</span>
                          <span className="font-semibold text-gray-900">{calculateAge(selectedMember.dateOfBirth)} years</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-gray-500">Allergies:</span>
                          <span className={`font-semibold ${selectedMember.allergies && selectedMember.allergies.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {selectedMember.allergies && selectedMember.allergies.length > 0 ? selectedMember.allergies.join(', ') : 'None'}
                          </span>
                        </div>
                        {doctorName && (
                          <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                            <span className="text-gray-500">Doctor:</span>
                            <span className="font-semibold text-gray-900 text-sm">{doctorName}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}


                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleGeneratePDF}
                disabled={generating || !doctorName || !visitDate}
                className="w-full flex items-center justify-center gap-2 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Health Summary PDF
                  </>
                )}
              </button>

              <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-xl border border-gray-200 shadow-sm transition-colors text-sm">
                <Share2 className="w-4 h-4 text-gray-400" />
                Create shareable link
              </button>

              <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-xl transition-colors text-sm shadow-sm">
                <MessageCircle className="w-4 h-4" />
                Send on WhatsApp
              </button>

              {/* Quick Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pro Tip:
                </p>
                <p className="mt-1 text-blue-600/80">
                  Sharing health records with your doctor helps them make better-informed decisions about your care.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}