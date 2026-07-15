'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  ChevronRight,
  ShieldCheck,
  Download,
  Search,
  ChevronDown,
  MoreVertical,
  Menu,
  RefreshCw,
  AlertCircle,
  Eye,
  UserX,
  UserCheck,
  Trash2,
  X,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';
import { useRouter } from 'next/navigation';

const planOptions   = ['All Plans', 'Family', 'Free', 'Pro', 'Premium'];
const statusOptions = ['All Status', 'active', 'suspended', 'inactive'];

// ── Modal Component ──────────────────────────────────────────
function ActionModal({ isOpen, onClose, onConfirm, title, message, action, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if ((action === 'suspend' || action === 'delete') && !reason.trim()) {
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

        {(action === 'suspend' || action === 'delete') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {action === 'delete' ? 'Deletion Reason' : 'Suspension Reason'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${action}...`}
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
            disabled={loading || ((action === 'suspend' || action === 'delete') && !reason.trim())}
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

function PlanBadge({ plan }) {
  const styles = {
    Family:  'bg-emerald-50 text-emerald-700 border-emerald-100',
    Free:    'bg-gray-100 text-gray-600 border-gray-200',
    Pro:     'bg-blue-50 text-blue-700 border-blue-100',
    Premium: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[plan] ?? styles.Free}`}>
      {plan}
    </span>
  );
}

export default function AdminPatientsPage() {
  const router = useRouter();
  const [active, setActive] = useState('patients');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    action: '',
    patientIds: [],
    title: '',
    message: '',
  });

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // Fetch patients data
  const fetchPatients = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        search,
        plan: planFilter,
        status: statusFilter,
        page,
        limit: 10,
      });

      const response = await fetch(`/api/admin/patients?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch patients');
      }

      if (result.success) {
        setPatients(result.data.patients);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        throw new Error(result.message || 'Failed to load patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error.message || 'Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, planFilter, statusFilter, page]);

  // Initial fetch
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchPatients();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, planFilter, statusFilter]);

  // Close open menu on scroll or click outside
  useEffect(() => {
    const handleScroll = () => {
      if (openMenu) setOpenMenu(null);
    };
    const handleClickOutside = (e) => {
      if (openMenu && !e.target.closest('.action-menu-wrapper')) {
        setOpenMenu(null);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle patient actions
  const handlePatientAction = async (action, patientIds, reason = '') => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, patientIds, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} patient`);
      }

      if (result.success) {
        showToast(`Patient(s) ${action}ed successfully!`);
        fetchPatients(true);
        setSelected([]);
        setOpenMenu(null);
        setModal({ isOpen: false, action: '', patientIds: [], title: '', message: '' });
      } else {
        throw new Error(result.message || `Failed to ${action} patient`);
      }
    } catch (error) {
      console.error(`Error ${action}ing patients:`, error);
      showToast(`Failed to ${action} patient(s): ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open modal for action
  const openActionModal = (action, patientIds) => {
    const actionTitles = {
      suspend: 'Suspend Patient(s)',
      unsuspend: 'Unsuspend Patient(s)',
      verify: 'Verify Patient(s)',
      delete: 'Delete Patient(s)',
    };

    const actionMessages = {
      suspend: `Are you sure you want to suspend ${patientIds.length} patient(s)? They will not be able to access their account.`,
      unsuspend: `Are you sure you want to unsuspend ${patientIds.length} patient(s)? They will regain access to their account.`,
      verify: `Are you sure you want to verify ${patientIds.length} patient(s)?`,
      delete: `Are you sure you want to delete ${patientIds.length} patient(s)? This action cannot be undone.`,
    };

    setModal({
      isOpen: true,
      action,
      patientIds,
      title: actionTitles[action],
      message: actionMessages[action],
    });
  };

  const handleViewPatient = (patientId) => {
    router.push(`/admin/patients/${patientId}`);
  };

  // ── CSV Export Function ──────────────────────────────────
  const exportToCSV = useCallback(async () => {
    try {
      setExporting(true);
      
      // Fetch all patients with current filters
      const params = new URLSearchParams({
        search,
        plan: planFilter,
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/patients/export?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch patients for export');
      }

      if (result.success) {
        const patientsData = result.data.patients;
        
        // Define CSV headers
        const headers = [
          'Name',
          'Email',
          'Phone',
          'City',
          'Plan',
          'Status',
          'Members',
          'Joined Date'
        ];

        // Map patient data to CSV rows
        const rows = patientsData.map(patient => {
          // Ensure joinDate is a string
          let joinDate = patient.joinDate || 'N/A';
          // If it's still a Date object, convert it
          if (joinDate instanceof Date) {
            joinDate = joinDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          
          return [
            `"${(patient.name || '').replace(/"/g, '""')}"`,
            `"${(patient.email || '').replace(/"/g, '""')}"`,
            `"${(patient.phone || '').replace(/"/g, '""')}"`,
            `"${(patient.city || '').replace(/"/g, '""')}"`,
            `"${(patient.plan || 'Free').replace(/"/g, '""')}"`,
            `"${(patient.status || 'inactive').replace(/"/g, '""')}"`,
            patient.members || 0,
            `"${joinDate}"`
          ];
        });

        // Combine headers and rows
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        // Add BOM for UTF-8 encoding
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `patients_export_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Successfully exported ${patientsData.length} patients!`, 'success');
      } else {
        throw new Error(result.message || 'Failed to export patients');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast(`Failed to export CSV: ${error.message}`, 'error');
    } finally {
      setExporting(false);
    }
  }, [search, planFilter, statusFilter]);

  // ── Export Selected Patients ──────────────────────────────
  const exportSelectedToCSV = useCallback(async () => {
    if (selected.length === 0) {
      showToast('Please select at least one patient to export', 'error');
      return;
    }

    try {
      setExporting(true);
      
      // Fetch only selected patients
      const params = new URLSearchParams({
        ids: selected.join(','),
      });

      const response = await fetch(`/api/admin/patients/export?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to export selected patients');
      }

      if (result.success) {
        const patientsData = result.data.patients;
        
        const headers = [
          'Name',
          'Email',
          'Phone',
          'City',
          'Plan',
          'Status',
          'Members',
          'Joined Date'
        ];

        const rows = patientsData.map(patient => {
          let joinDate = patient.joinDate || 'N/A';
          if (joinDate instanceof Date) {
            joinDate = joinDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          
          return [
            `"${(patient.name || '').replace(/"/g, '""')}"`,
            `"${(patient.email || '').replace(/"/g, '""')}"`,
            `"${(patient.phone || '').replace(/"/g, '""')}"`,
            `"${(patient.city || '').replace(/"/g, '""')}"`,
            `"${(patient.plan || 'Free').replace(/"/g, '""')}"`,
            `"${(patient.status || 'inactive').replace(/"/g, '""')}"`,
            patient.members || 0,
            `"${joinDate}"`
          ];
        });

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `selected_patients_export_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Successfully exported ${patientsData.length} selected patients!`, 'success');
        setSelected([]);
      } else {
        throw new Error(result.message || 'Failed to export selected patients');
      }
    } catch (error) {
      console.error('Error exporting selected patients:', error);
      showToast(`Failed to export: ${error.message}`, 'error');
    } finally {
      setExporting(false);
    }
  }, [selected]);

  const allChecked = patients.length > 0 && patients.every((p) => selected.includes(p.id));
  const toggleAll = () => setSelected(allChecked ? [] : patients.map((p) => p.id));
  const toggleOne = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);

  // Bulk actions
  const handleBulkAction = (action) => {
    if (selected.length === 0) {
      showToast('Please select at least one patient', 'error');
      return;
    }
    openActionModal(action, selected);
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
              <p className="text-gray-600">Loading patients...</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Patients</h3>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => fetchPatients()}
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
          <span className="text-sm font-semibold text-gray-700">Patients</span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchPatients(true)}
              disabled={refreshing}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Admin
            </div>
            {/*
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>
            */}
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">SA</div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] mx-auto">
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
            onClose={() => setModal({ isOpen: false, action: '', patientIds: [], title: '', message: '' })}
            onConfirm={(reason) => handlePatientAction(modal.action, modal.patientIds, reason)}
            title={modal.title}
            message={modal.message}
            action={modal.action}
            loading={actionLoading}
          />

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Patients</h1>
              <p className="text-sm text-gray-400 mt-1">{total} total registered patients</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selected.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction('verify')}
                    className="flex items-center gap-2 bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" /> Verify ({selected.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="flex items-center gap-2 bg-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    <UserX className="w-4 h-4" /> Suspend ({selected.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('unsuspend')}
                    className="flex items-center gap-2 bg-emerald-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" /> Unsuspend ({selected.length})
                  </button>
                  <button
                    onClick={exportSelectedToCSV}
                    disabled={exporting}
                    className="flex items-center justify-center gap-2 bg-purple-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> 
                    {exporting ? 'Exporting...' : `Export Selected (${selected.length})`}
                  </button>
                </>
              )}
              <button 
                onClick={exportToCSV}
                disabled={exporting}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> 
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer w-full"
                >
                  {planOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer w-full"
                >
                  {statusOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[40px_1fr_140px_100px_110px_80px_40px] items-center px-5 py-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
              />
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Patient</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-right">City</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Plan</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Members</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Status</span>
              <span />
            </div>

            {/* Rows */}
            {patients.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">No patients match your filters.</div>
            )}
            {patients.map((p, i) => {
              const initials = getInitials(p.name);
              const color = getAvatarColor(p.name);
              
              return (
                <div
                  key={p.id}
                  className={`p-4 md:p-0 transition-colors ${
                    selected.includes(p.id) ? 'bg-gray-50' : 'hover:bg-gray-50'
                  } ${i < patients.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[40px_1fr_140px_100px_110px_80px_40px] items-center px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                    />

                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate">{p.email}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 text-right pr-4">{p.city}</p>
                    <div className="flex justify-center"><PlanBadge plan={p.plan} /></div>
                    <p className="text-sm text-gray-600 text-center">{p.members} members</p>
                    <div className="flex justify-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.statusColor || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {p.statusLabel || p.status}
                      </span>
                    </div>

                    <div className="relative flex justify-center action-menu-wrapper">
                      <button
                        onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === p.id && (
                        <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44">
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              handleViewPatient(p.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View Profile
                          </button>
                          {p.isSuspended ? (
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                openActionModal('unsuspend', [p.id]);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" /> Unsuspend
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                openActionModal('suspend', [p.id]);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <UserX className="w-4 h-4" /> Suspend
                            </button>
                          )}
                          {!p.isVerified && (
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                openActionModal('verify', [p.id]);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" /> Verify
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              openActionModal('delete', [p.id]);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer mt-1"
                    />
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400 truncate">{p.email}</p>
                        </div>
                        <div className="relative action-menu-wrapper">
                          <button
                            onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {openMenu === p.id && (
                            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44">
                              <button
                                onClick={() => {
                                  setOpenMenu(null);
                                  handleViewPatient(p.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> View Profile
                              </button>
                              {p.isSuspended ? (
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    openActionModal('unsuspend', [p.id]);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4" /> Unsuspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    openActionModal('suspend', [p.id]);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                  <UserX className="w-4 h-4" /> Suspend
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setOpenMenu(null);
                                  openActionModal('delete', [p.id]);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{p.city}</span>
                        <PlanBadge plan={p.plan} />
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.statusColor || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {p.statusLabel || p.status}
                        </span>
                        <span className="text-xs text-gray-500">{p.members} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            <div className="px-4 md:px-5 py-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-400">
                Showing {patients.length} of {total} patients
              </p>
              {totalPages > 1 && (
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
              )}
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

// ── Utility Functions ──────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name) {
  if (!name) return 'bg-gray-500';
  const colors = [
    'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-rose-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-violet-500',
    'bg-lime-500', 'bg-fuchsia-500', 'bg-sky-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}