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
  XCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';
import { useRouter } from 'next/navigation';

const specialtyOptions = ['All Specialties', 'Cardiologist', 'Diabetologist', 'Neurologist', 'Orthopedic', 'Gynecologist', 'Pediatrician'];
const statusOptions = ['All Status', 'pending', 'approved', 'rejected', 'suspended'];

// ── Modal Component ──────────────────────────────────────────
function ActionModal({ isOpen, onClose, onConfirm, title, message, action, loading, doctorName }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if ((action === 'reject' || action === 'suspend') && !reason.trim()) {
      return;
    }
    onConfirm(reason, note);
  };

  const getActionColor = () => {
    switch (action) {
      case 'approve': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'reject': return 'bg-red-500 hover:bg-red-600';
      case 'suspend': return 'bg-amber-500 hover:bg-amber-600';
      case 'unsuspend': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'delete': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getActionLabel = () => {
    switch (action) {
      case 'approve': return 'Approve';
      case 'reject': return 'Reject';
      case 'suspend': return 'Suspend';
      case 'unsuspend': return 'Unsuspend';
      case 'delete': return 'Delete';
      default: return 'Confirm';
    }
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

        <p className="text-sm text-gray-600 mb-4">
          {message}
          {doctorName && <span className="font-semibold text-gray-900"> {doctorName}</span>}
        </p>

        {(action === 'reject' || action === 'suspend') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {action === 'reject' ? 'Rejection Reason' : 'Suspension Reason'} *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter ${action === 'reject' ? 'rejection' : 'suspension'} reason...`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
              rows="3"
            />
            {!reason.trim() && (
              <p className="text-xs text-red-500 mt-1">Please provide a reason</p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Note <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal note..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || ((action === 'reject' || action === 'suspend') && !reason.trim())}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${getActionColor()}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              getActionLabel()
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast Component ──────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
      type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
    }`}>
      {message}
    </div>
  );
}

// ── Status Badge Component ──────────────────────────────────
function StatusBadge({ status }) {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 shadow-sm">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 shadow-sm">
          <XCircle className="w-3.5 h-3.5" />
          Suspended
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200 shadow-sm">
          Unknown
        </span>
      );
  }
}

// ── Certificate Preview Component ──────────────────────────
function CertificatePreview({ certificate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewerError, setViewerError] = useState(false);
  
  if (!certificate) {
    return <span className="text-xs text-gray-400">No certificate</span>;
  }

  const isImage = certificate.fileType?.startsWith('image/');
  const isPDF = certificate.fileType === 'application/pdf';

  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  };

  const fileExt = getFileExtension(certificate.fileName);

  return (
    <>
      <button
        onClick={() => {
          setIsModalOpen(true);
          setViewerError(false);
        }}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        {isImage ? (
          <ImageIcon className="w-3.5 h-3.5" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        View Certificate
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-semibold text-gray-900">Medical Certificate</h3>
                <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-md">
                  {certificate.fileName}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center min-h-[400px]">
              {isImage ? (
                <img 
                  src={certificate.url} 
                  alt={certificate.fileName}
                  className="max-w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.alt = 'Failed to load image';
                  }}
                />
              ) : isPDF || fileExt === 'pdf' ? (
                <div className="w-full">
                  {!viewerError ? (
                    <>
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(certificate.url)}&embedded=true`}
                        className="w-full h-[70vh] border border-gray-200 rounded-lg"
                        title={certificate.fileName}
                        onError={() => setViewerError(true)}
                      />
                      <div className="text-center mt-4 flex flex-wrap justify-center gap-3">
                        <a 
                          href={certificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Open PDF in New Tab
                        </a>
                        <a 
                          href={certificate.url}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Unable to preview the PDF</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <a 
                          href={certificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Open PDF in New Tab
                        </a>
                        <a 
                          href={certificate.url}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Unsupported file type: {certificate.fileType || 'Unknown'}</p>
                  <a 
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                File: {certificate.fileName}
              </div>
              <a 
                href={certificate.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Component ──────────────────────────────────────────
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
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, suspended: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [modal, setModal] = useState({
    isOpen: false,
    action: '',
    doctorId: null,
    doctorName: '',
    title: '',
    message: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);

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
        setStats(result.data.stats || { pending: 0, approved: 0, rejected: 0, suspended: 0 });
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

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

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

  const openActionModal = (action, doctorId, doctorName) => {
    const actionTitles = {
      approve: 'Approve Doctor',
      reject: 'Reject Doctor',
      suspend: 'Suspend Doctor',
      unsuspend: 'Unsuspend Doctor',
      delete: 'Delete Doctor',
    };

    const actionMessages = {
      approve: 'Are you sure you want to approve',
      reject: 'Are you sure you want to reject',
      suspend: 'Are you sure you want to suspend',
      unsuspend: 'Are you sure you want to unsuspend',
      delete: 'Are you sure you want to delete',
    };

    setModal({
      isOpen: true,
      action,
      doctorId,
      doctorName,
      title: actionTitles[action] || 'Confirm Action',
      message: actionMessages[action] || 'Are you sure you want to proceed with this action?',
    });
  };

  const handleDoctorAction = async (action, doctorId, reason = '', note = '') => {
    try {
      setActionLoading(true);
      
      const response = await fetch('/api/admin/doctors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          doctorIds: [doctorId], 
          reason, 
          note 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} doctor`);
      }

      if (result.success) {
        showToast(`Doctor ${action}d successfully!`);
        fetchDoctors(true);
        setOpenMenuId(null);
        setModal({ isOpen: false, action: '', doctorId: null, doctorName: '', title: '', message: '' });
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
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}

      <ActionModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, action: '', doctorId: null, doctorName: '', title: '', message: '' })}
        onConfirm={(reason, note) => handleDoctorAction(modal.action, modal.doctorId, reason, note)}
        title={modal.title}
        message={modal.message}
        action={modal.action}
        loading={actionLoading}
        doctorName={modal.doctorName}
      />

      <AdminSidebar 
        active={active} 
        setActive={setActive} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 w-full md:pl-[260px]">
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Doctors</h1>
              <p className="text-sm text-gray-400 mt-1">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {stats.approved || 0} approved
                </span>
                <span className="mx-2">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {stats.pending || 0} pending
                </span>
                <span className="mx-2">·</span>
                <span className="inline-flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  {stats.rejected || 0} rejected
                </span>
                <span className="mx-2">·</span>
                <span className="inline-flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  {stats.suspended || 0} suspended
                </span>
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {stats.pending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      {stats.pending} doctors awaiting approval
                    </p>
                    <p className="text-xs text-amber-600/80">
                      Review and approve doctor applications before they can start practicing
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

          <div className="space-y-3">
            {doctors.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-12 text-center text-gray-400 text-sm">
                No doctors match your filters.
              </div>
            )}

            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                      {doctor.name?.split(' ').map(n => n[0]).join('') || 'D'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{doctor.name}</h3>
                        <span className="text-xs text-gray-400 truncate">{doctor.specialty} · {doctor.city}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                        <span className="font-mono">{doctor.medicalRegNo}</span>
                        {doctor.status === 'approved' && (
                          <>
                            <span>★ {doctor.rating || 0} ({doctor.reviews || 0} reviews)</span>
                          </>
                        )}
                        <span className="hidden sm:inline">Joined {new Date(doctor.joined).toLocaleDateString()}</span>
                        <CertificatePreview certificate={doctor.medicalCertificate} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                    <StatusBadge status={doctor.status} />
                    
                    {doctor.status === 'pending' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewDoctor(doctor.id)}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">View</span>
                        </button>
                        <button
                          onClick={() => openActionModal('approve', doctor.id, doctor.name)}
                          disabled={actionLoading}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Approve</span>
                        </button>
                        <button
                          onClick={() => openActionModal('reject', doctor.id, doctor.name)}
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
                          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-48">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleViewDoctor(doctor.id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> View Profile
                            </button>
                            {doctor.status === 'approved' && (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openActionModal('suspend', doctor.id, doctor.name);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <UserX className="w-4 h-4" /> Suspend
                              </button>
                            )}
                            {doctor.status === 'suspended' && (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openActionModal('unsuspend', doctor.id, doctor.name);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" /> Unsuspend
                              </button>
                            )}
                            {doctor.status === 'rejected' && (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openActionModal('approve', doctor.id, doctor.name);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" /> Reconsider & Approve
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                openActionModal('delete', doctor.id, doctor.name);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100 mt-1 pt-1"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400 sm:hidden mt-2">
                  Joined {new Date(doctor.joined).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

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

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
            <span>Showing {doctors.length} of {total} doctors</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {stats.approved || 0} approved
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {stats.pending || 0} pending
              </span>
              <span className="inline-flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                {stats.rejected || 0} rejected
              </span>
              <span className="inline-flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                {stats.suspended || 0} suspended
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 py-2">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}