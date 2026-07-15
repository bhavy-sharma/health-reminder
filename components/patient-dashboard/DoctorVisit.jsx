'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
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
  Clipboard,
  MapPin,
  Star,
  Building,
  Search,
  ExternalLink,
  Link2,
  Share,
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

// ─── Specialties ──────────────────────────────────────────────
const SPECIALTIES = [
  "Cardiologist", "Neurologist", "Orthopedic Surgeon", "Ophthalmologist",
  "Pediatrician", "Diabetologist", "Dermatologist", "Psychiatrist",
  "Gynecologist", "Urologist", "ENT Specialist", "General Physician",
  "Oncologist", "Gastroenterologist", "Pulmonologist", "Nephrologist",
  "Endocrinologist", "Rheumatologist", "Hematologist",
  "Infectious Disease Specialist", "Geriatrician", "Anesthesiologist",
  "Radiologist", "Pathologist", "Emergency Medicine Specialist",
  "Sports Medicine Specialist", "Pain Management Specialist",
  "Sleep Medicine Specialist", "Palliative Care Specialist",
  "Nutritionist", "Physiotherapist", "Chiropractor", "Psychologist",
  "Speech Therapist", "Occupational Therapist", "Audiologist",
  "Dietitian", "Homeopath", "Ayurvedic Doctor", "Naturopath", "Acupuncturist"
];

export default function DoctorVisitPrepPage() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialty, setSpecialty] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [reason, setReason] = useState('');
  const [generating, setGenerating] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [shareableLink, setShareableLink] = useState(null);
  const [shareableLinkId, setShareableLinkId] = useState(null);
  const [userData, setUserData] = useState(null);

  // Doctor recommendations state
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        setLoading(true);
        const profileRes = await fetch('/api/user/profile');
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();
        const user = profileData.user;
        setUserData(user);

        if (user?.address?.city) {
          setUserLocation(user.address.city);
        }

        const familyId = user?.activeFamilyId?._id || user?.activeFamilyId;
        let allMembers = [];

        if (familyId) {
          const membersRes = await fetch(`/api/family/members?familyId=${familyId}`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            const members = membersData.members || [];
            
            members.forEach(member => {
              const isYou = member.isPrimary === true;
              allMembers.push({
                _id: member._id,
                userId: isYou ? user._id : null,
                name: isYou ? `${member.name} (You)` : member.name,
                dateOfBirth: member.dateOfBirth,
                gender: member.gender,
                bloodGroup: member.bloodGroup,
                avatarColor: member.avatarColor || '#6B7280',
                allergies: member.allergies || [],
                isPrimary: member.isPrimary || false,
              });
            });
          }
        }

        if (allMembers.length === 0 && user) {
          allMembers.push({
            _id: user._id,
            userId: user._id,
            name: `${user.fullName} (You)`,
            dateOfBirth: user.profile?.dateOfBirth,
            gender: user.profile?.gender,
            bloodGroup: user.profile?.bloodGroup,
            avatarColor: user.profile?.avatarColor || '#0D1B2A',
            allergies: user.allergies || [],
            isPrimary: true,
          });
        }

        setFamilyMembers(allMembers);
        if (allMembers.length > 0) {
          setSelectedMember(allMembers[0]);
        }
      } catch (err) {
        console.error('Error fetching family data:', err);
        setError('Failed to load family members');
        toast.error('Failed to load family members');
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyData();
  }, []);

  // Fetch doctors when specialty changes
  useEffect(() => {
    if (specialty) {
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [specialty]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const params = new URLSearchParams();

      if (specialty) params.append('specialty', specialty);
      if (userLocation) params.append('city', userLocation);
      params.append('limit', '20');

      const response = await fetch(`/api/doctors?${params}`);
      const result = await response.json();

      if (result.success) {
        setDoctors(result.data.doctors || []);
        if (result.data.doctors.length === 0) {
          toast.error(`No ${specialty} doctors found${userLocation ? ` near ${userLocation}` : ''}`);
        }
      } else {
        setDoctors([]);
        toast.error(result.error || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      toast.error('Failed to fetch doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDoctorClick = (doctorId) => {
    router.push(`/find-doctors/${doctorId}`);
  };

  // ─── Create Shareable Link ──────────────────────────────────
  const handleCreateShareableLink = async () => {
    if (!selectedMember) {
      toast.error('Please select a family member first');
      return;
    }

    if (!visitDate) {
      toast.error('Please select a visit date');
      return;
    }

    setCreatingLink(true);
    const toastId = toast.loading('Creating shareable link...');

    try {
      const familyId = userData?.activeFamilyId?._id || userData?.activeFamilyId;

      if (!familyId) {
        toast.error('No family found.', { id: toastId });
        setCreatingLink(false);
        return;
      }

      const memberId = selectedMember._id;

      const shareData = {
        familyId: familyId,
        memberId: memberId,
        patient: {
          name: selectedMember.name.replace(' (You)', ''),
          age: calculateAge(selectedMember.dateOfBirth),
          gender: selectedMember.gender || 'N/A',
          bloodGroup: selectedMember.bloodGroup || 'N/A',
          allergies: selectedMember.allergies || [],
        },
        doctor: {
          name: doctors.length > 0 ? doctors[0].name : 'Not specified',
          specialty: specialty || 'N/A',
          hospital: doctors[0]?.hospital || 'N/A',
          city: doctors[0]?.city || 'N/A',
          consultationFee: doctors[0]?.consultationFee || 0,
        },
        visit: {
          date: visitDate || 'Not specified',
          time: visitTime || 'Not specified',
          reason: reason || 'Not specified',
        },
        generatedAt: new Date().toISOString(),
      };

      const shareResponse = await fetch('/api/doctor-visit-pdf/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData),
      });

      if (!shareResponse.ok) {
        const errorData = await shareResponse.json();
        throw new Error(errorData.error || 'Failed to create shareable link');
      }

      const shareResult = await shareResponse.json();
      const shareId = shareResult.shareId;
      const fullUrl = `${window.location.origin}/share/health-summary/${shareId}`;
      
      setShareableLink(fullUrl);
      setShareableLinkId(shareId);

      await navigator.clipboard.writeText(fullUrl);
      toast.success('Shareable link created and copied to clipboard!', { id: toastId });

    } catch (error) {
      console.error('Error creating shareable link:', error);
      toast.error(`Failed to create shareable link: ${error.message}`, { id: toastId });
    } finally {
      setCreatingLink(false);
    }
  };

  // ─── WhatsApp Share Handler ──────────────────────────────────
  const handleWhatsAppShare = () => {
    if (!shareableLink) {
      toast.error('Please create a shareable link first');
      return;
    }

    // Get the selected doctor's name for the message
    const doctorName = doctors.length > 0 ? doctors[0].name : 'your doctor';
    const patientName = selectedMember?.name?.replace(' (You)', '') || 'Patient';
    
    // Create a descriptive message
    const message = encodeURIComponent(
      `👋 Hi Doctor,\n\n` +
      `I'm sharing the health summary for ${patientName} for our upcoming appointment.\n\n` +
      `📋 Patient: ${patientName}\n` +
      `👨‍⚕️ Doctor: ${doctorName}\n` +
      `📅 Visit Date: ${visitDate || 'Not specified'}\n` +
      `🕐 Time: ${visitTime || 'Not specified'}\n\n` +
      `🔗 View Health Summary: ${shareableLink}\n\n` +
      `Please review the health records before the appointment. Thank you!`
    );

    // WhatsApp Web URL
    const whatsappUrl = `https://wa.me/?text=${message}`;
    
    // Open in new window
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp...');
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1a1a2e',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
          success: {
            style: {
              border: '1px solid #4ade80',
            },
          },
          error: {
            style: {
              border: '1px solid #f87171',
            },
          },
        }}
      />
      <Sidebar />

      <main className="md:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10">

          {/* Header */}
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
                Share your health records with your doctor
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
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 py-5 transition-all ${active
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

              {/* Step 2: Find a Doctor */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-serif font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="bg-[#0D1B2A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Find a Doctor
                </h2>
                <div className="space-y-4">

                  {/* Specialty Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Specialty *</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="">Select a specialty</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor Name (Optional)</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="Search for a specific doctor..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Type a doctor's name to filter the list below</p>
                  </div>

                  {/* Recommended Doctors */}
                  {specialty && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Recommended {specialty} Doctors
                        {userLocation && (
                          <span className="text-xs text-gray-400 font-normal ml-2">
                            near {userLocation}
                          </span>
                        )}
                      </label>

                      {loadingDoctors ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : doctors.length > 0 ? (
                        <div>
                          <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by name, hospital, or specialty..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] text-sm"
                            />
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredDoctors.length === 0 ? (
                              <p className="text-sm text-gray-400 text-center py-4">No doctors match your search</p>
                            ) : (
                              filteredDoctors.map((doctor) => (
                                <div
                                  key={doctor._id}
                                  onClick={() => handleDoctorClick(doctor._id)}
                                  className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full ${getColorClass(doctor.avatarColor || '#6B7280')} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                      {doctor.name?.charAt(0).toUpperCase() || 'D'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900 text-sm">{doctor.name}</p>
                                        <span className="text-xs text-blue-600 flex items-center gap-1">
                                          View Profile
                                          <ExternalLink className="w-3 h-3" />
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500">{doctor.specialty}</p>
                                      {doctor.hospital && (
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                          <Building className="w-3 h-3" />
                                          {doctor.hospital}
                                        </p>
                                      )}
                                      {doctor.city && (
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {doctor.city}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 mt-1">
                                        {doctor.consultationFee > 0 && (
                                          <span className="text-xs font-medium text-gray-700">
                                            ₹{doctor.consultationFee} fee
                                          </span>
                                        )}
                                        {doctor.experience > 0 && (
                                          <span className="text-xs text-gray-500">
                                            {doctor.experience} yrs exp
                                          </span>
                                        )}
                                        {doctor.rating > 0 && (
                                          <span className="text-xs text-amber-500 flex items-center gap-0.5">
                                            <Star className="w-3 h-3 fill-amber-500" />
                                            {doctor.rating}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-500">No {specialty} doctors found</p>
                          <p className="text-xs text-gray-400 mt-1">Try selecting a different specialty</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visit Date and Time */}
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
                        {doctors.length > 0 && (
                          <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                            <span className="text-gray-500">Doctor:</span>
                            <span className="font-semibold text-gray-900 text-sm">{doctors[0].name}</span>
                          </div>
                        )}
                        {visitDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Visit Date:</span>
                            <span className="font-semibold text-gray-900 text-sm">{visitDate}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Shareable Link Display */}
                {shareableLink && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">Shareable Link:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareableLink}
                        readOnly
                        className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 truncate"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareableLink);
                          toast.success('Link copied to clipboard!');
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}

              {/* Shareable Link Button */}
              <button
                onClick={handleCreateShareableLink}
                disabled={creatingLink || !selectedMember || !visitDate}
                className="w-full flex items-center justify-center gap-2 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingLink ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Link...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Create Shareable Link
                  </>
                )}
              </button>

              {/* WhatsApp Share Button - FIXED */}
              <button
                onClick={handleWhatsAppShare}
                disabled={!shareableLink}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-medium py-3.5 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share on WhatsApp
              </button>

              {/* Quick Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pro Tip:
                </p>
                <p className="mt-1 text-blue-600/80">
                  Share the link with your doctor before the appointment so they can review your records in advance.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}