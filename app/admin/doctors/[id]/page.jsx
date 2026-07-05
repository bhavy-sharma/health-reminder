// app/admin/doctors/[id]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Building,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  Loader,
  AlertCircle,
  RefreshCw,
  X,
  Star,
  Stethoscope,
  Award,
  Clock,
  CheckCircle,
  Video,
  DollarSign,
  Languages,
  GraduationCap,
  FileText,
  Users,
  Heart,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

// ── Modal Component ──────────────────────────────────────────
function ActionModal({ isOpen, onClose, onConfirm, title, message, action, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (action === 'suspend' && !reason.trim()) {
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">{message}</p>

        {action === 'suspend' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suspension Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for suspension..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
              rows="3"
            />
            {!reason.trim() && (
              <p className="text-xs text-red-500 mt-1">Please provide a reason</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (action === 'suspend' && !reason.trim())}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
              action === 'delete' 
                ? 'bg-red-500 hover:bg-red-600' 
                : action === 'suspend'
                ? 'bg-amber-500 hover:bg-amber-600'
                : action === 'unsuspend'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ isVerified }) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle className="w-3.5 h-3.5" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [active, setActive] = useState('doctors');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    action: '',
    title: '',
    message: '',
  });

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const doctorId = params?.id;

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    } else {
      setError('No doctor ID provided');
      setLoading(false);
    }
  }, [doctorId]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchDoctorDetails = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      if (!doctorId) {
        throw new Error('No doctor ID provided');
      }
      
      const response = await fetch(`/api/admin/doctors/${doctorId}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an error. Please try again.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch doctor details');
      }

      if (result.success) {
        setDoctor(result.data);
      } else {
        throw new Error(result.message || 'Failed to load doctor');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError(error.message || 'Failed to load doctor details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDoctorDetails(true);
  };

  const handleAction = async (action, reason = '') => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          doctorIds: [doctorId],
          reason 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} doctor`);
      }

      if (result.success) {
        showToast(`Doctor ${action}ed successfully!`);
        fetchDoctorDetails(true);
        setModal({ isOpen: false, action: '', title: '', message: '' });
      } else {
        throw new Error(result.message || `Failed to ${action} doctor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing doctor:`, error);
      showToast(`Failed to ${action} doctor: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (action) => {
    const actionTitles = {
      suspend: 'Suspend Doctor',
      unsuspend: 'Unsuspend Doctor',
      verify: 'Verify Doctor',
      delete: 'Delete Doctor',
    };

    const actionMessages = {
      suspend: `Are you sure you want to suspend ${doctor?.name}? They will not be able to practice on the platform.`,
      unsuspend: `Are you sure you want to unsuspend ${doctor?.name}? They will regain access to the platform.`,
      verify: `Are you sure you want to verify ${doctor?.name}? They will be able to start practicing.`,
      delete: `Are you sure you want to delete ${doctor?.name}? This action cannot be undone.`,
    };

    setModal({
      isOpen: true,
      action,
      title: actionTitles[action],
      message: actionMessages[action],
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex">
        <AdminSidebar active={active} setActive={setActive} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 w-full md:pl-[260px]">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading doctor details...</p>
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
        <AdminSidebar active={active} setActive={setActive} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 w-full md:pl-[260px]">
          <div className="flex items-center justify-center h-screen p-4">
            <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Doctor</h3>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => fetchDoctorDetails()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex">
        <AdminSidebar active={active} setActive={setActive} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 w-full md:pl-[260px]">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Doctor not found</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex">
      <AdminSidebar active={active} setActive={setActive} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 w-full md:pl-[260px]">
        <div className="p-4 sm:p-8 max-w-[1200px] mx-auto">
          {/* Toast Notification */}
          {toast.show && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
            }`}>
              {toast.message}
            </div>
          )}

          {/* Action Modal */}
          <ActionModal
            isOpen={modal.isOpen}
            onClose={() => setModal({ isOpen: false, action: '', title: '', message: '' })}
            onConfirm={(reason) => handleAction(modal.action, reason)}
            title={modal.title}
            message={modal.message}
            action={modal.action}
            loading={actionLoading}
          />

          {/* Back button and refresh */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Doctors
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                  {doctor.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                  <p className="text-sm text-gray-400">{doctor.specialty} · {doctor.city}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge isVerified={doctor.isVerified} />
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">ID: {doctor._id?.slice(-8) || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="w-5 h-5 text-gray-500" />
                </button>
                {doctor.isVerified ? (
                  <>
                    <button
                      onClick={() => openActionModal('suspend')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      <UserX className="w-4 h-4" /> Suspend
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openActionModal('verify')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" /> Verify
                    </button>
                    <button
                      onClick={() => openActionModal('delete')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Rating</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.stats?.avgRating || 0} ★</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Reviews</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.stats?.reviewCount || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Experience</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.experience || 0} years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.city || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Hospital</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.hospital || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Medical Registration</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.medicalRegNo || 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Specialty</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.specialty || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Experience</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.experience || 0} years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Consultation Fee</p>
                    <p className="text-sm font-medium text-gray-900">₹{doctor.consultationFee || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Video Consult Fee</p>
                    <p className="text-sm font-medium text-gray-900">₹{doctor.videoConsultFee || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Languages</p>
                    <p className="text-sm font-medium text-gray-900">
                      {doctor.languages?.length > 0 ? doctor.languages.join(', ') : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Tagline</p>
                    <p className="text-sm font-medium text-gray-900">{doctor.tagline || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {doctor.about || 'No description provided.'}
              </p>
            </div>

            {/* Education & Awards */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Education & Awards</h2>
              <div className="space-y-4">
                {doctor.education && doctor.education.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Education</p>
                    <ul className="space-y-1">
                      {doctor.education.map((edu, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {doctor.awards && doctor.awards.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Awards</p>
                    <ul className="space-y-1">
                      {doctor.awards.map((award, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Award className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <span>{award}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(!doctor.education || doctor.education.length === 0) && 
                 (!doctor.awards || doctor.awards.length === 0) && (
                  <p className="text-sm text-gray-400">No education or awards information available.</p>
                )}
              </div>
            </div>

            {/* Conditions Treated */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Conditions Treated</h2>
              {doctor.conditions && doctor.conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {doctor.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-lg border border-gray-100"
                    >
                      <Heart className="w-3.5 h-3.5 text-gray-400" />
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No conditions specified.</p>
              )}
            </div>

            {/* Appointment Slots */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Appointment Slots</h2>
              {doctor.appointmentSlots && doctor.appointmentSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {doctor.appointmentSlots.map((slot, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No appointment slots configured.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}