// app/admin/patients/[id]/page.jsx
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
  Users,
  Building,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  Loader,
  AlertCircle,
  RefreshCw,
  X,
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

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [active, setActive] = useState('patients');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
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

  // Get the ID from params
  const patientId = params?.id;
  
  console.log('Patient ID from params:', patientId);

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    } else {
      setError('No patient ID provided');
      setLoading(false);
    }
  }, [patientId]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchPatientDetails = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('Fetching patient details for ID:', patientId);
      
      if (!patientId) {
        throw new Error('No patient ID provided');
      }
      
      const response = await fetch(`/api/admin/patients/${patientId}`);
      console.log('Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an error. Please try again.');
      }

      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch patient details');
      }

      if (result.success) {
        setPatient(result.data);
        console.log('Patient data loaded successfully');
      } else {
        throw new Error(result.message || 'Failed to load patient');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError(error.message || 'Failed to load patient details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPatientDetails(true);
  };

  const handleAction = async (action, reason = '') => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          patientIds: [patientId],
          reason 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} patient`);
      }

      if (result.success) {
        showToast(`Patient ${action}ed successfully!`);
        fetchPatientDetails(true);
        setModal({ isOpen: false, action: '', title: '', message: '' });
      } else {
        throw new Error(result.message || `Failed to ${action} patient`);
      }
    } catch (error) {
      console.error(`Error ${action}ing patient:`, error);
      showToast(`Failed to ${action} patient: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (action) => {
    const actionTitles = {
      suspend: 'Suspend Patient',
      unsuspend: 'Unsuspend Patient',
      verify: 'Verify Patient',
      delete: 'Delete Patient',
    };

    const actionMessages = {
      suspend: `Are you sure you want to suspend ${patient?.fullName}? They will not be able to access their account.`,
      unsuspend: `Are you sure you want to unsuspend ${patient?.fullName}? They will regain access to their account.`,
      verify: `Are you sure you want to verify ${patient?.fullName}?`,
      delete: `Are you sure you want to delete ${patient?.fullName}? This action cannot be undone.`,
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
              <p className="text-gray-600">Loading patient details...</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Patient</h3>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => fetchPatientDetails()}
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex">
        <AdminSidebar active={active} setActive={setActive} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 w-full md:pl-[260px]">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Patient not found</p>
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
              <ArrowLeft className="w-4 h-4" /> Back to Patients
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
                <div className={`w-20 h-20 rounded-full ${patient.profile?.avatarColor ? `bg-[${patient.profile.avatarColor}]` : 'bg-emerald-500'} flex items-center justify-center text-white text-2xl font-bold`}>
                  {patient.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{patient.fullName}</h1>
                  <p className="text-sm text-gray-400">{patient.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      patient.isSuspended ? 'bg-red-50 text-red-500 border-red-100' :
                      patient.isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {patient.isSuspended ? 'Suspended' : patient.isVerified ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">Patient ID: {patient._id?.slice(-8) || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="w-5 h-5 text-gray-500" />
                </button>
                {patient.isSuspended ? (
                  <button
                    onClick={() => openActionModal('unsuspend')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" /> Unsuspend
                  </button>
                ) : (
                  <button
                    onClick={() => openActionModal('suspend')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" /> Suspend
                  </button>
                )}
                <button
                  onClick={() => openActionModal('delete')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Role</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{patient.role || 'Patient'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {patient.isSuspended ? 'Suspended' : patient.isVerified ? 'Verified' : 'Unverified'}
                  </p>
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
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Family Members</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.familyMembers?.length || 0}</p>
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
                    <p className="text-sm font-medium text-gray-900">{patient.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Mobile</p>
                    <p className="text-sm font-medium text-gray-900">{patient.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">City</p>
                    <p className="text-sm font-medium text-gray-900">{patient.city || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{patient.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Verification Status</p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.isVerified ? 'Verified' : 'Unverified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.lastLogin ? new Date(patient.lastLogin).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Family Plan</p>
                    <p className="text-sm font-medium text-gray-900">{patient.plan || 'Free'}</p>
                  </div>
                </div>
                {patient.isSuspended && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs text-gray-400">Suspension Reason</p>
                      <p className="text-sm font-medium text-red-600">{patient.suspendedReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Family Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Family Information</h2>
              {patient.familyMembers && patient.familyMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Relationship</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.familyMembers.map((member) => (
                        <tr key={member._id} className="border-b border-gray-50">
                          <td className="py-2 font-medium text-gray-900">{member.name}</td>
                          <td className="py-2 text-gray-600 capitalize">{member.relationship}</td>
                          <td className="py-2 text-gray-500">{member.email || 'N/A'}</td>
                          <td className="py-2 text-gray-500">{member.phone || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No family members found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}