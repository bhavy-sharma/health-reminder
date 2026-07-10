'use client';

import React, { useState, useEffect } from 'react';
import {
    Upload,
    Search,
    SlidersHorizontal,
    Eye,
    Download,
    Share2,
    Trash2,
    FileText,
    ClipboardList,
    Scan,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Copy,
    LayoutGrid,
    List,
    Calendar,
    Filter,
    Shield,
    UserX
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const categories = ['All Records', 'Lab Reports', 'Prescriptions', 'Scans', 'Vaccinations', 'Doctor Notes'];

const iconConfig = {
    lab: { bg: 'bg-rose-50', icon: FileText, color: 'text-rose-600' },
    prescription: { bg: 'bg-blue-50', icon: ClipboardList, color: 'text-blue-600' },
    scan: { bg: 'bg-purple-50', icon: Scan, color: 'text-purple-600' },
};

function RecordIcon({ type }) {
    const cfg = iconConfig[type] ?? iconConfig.lab;
    const Icon = cfg.icon;
    return (
        <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 shadow-sm`}>
            <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
    );
}

// Toast helper functions
const showSuccessToast = (message) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex border border-emerald-100`}>
            <div className="flex-1 p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-bold text-gray-900">{message}</p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500 border-l border-gray-100">
                <X className="w-5 h-5" />
            </button>
        </div>
    ), { duration: 3000 });
};

const showErrorToast = (message) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex border border-rose-100`}>
            <div className="flex-1 p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <p className="text-sm font-bold text-gray-900">{message}</p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500 border-l border-gray-100">
                <X className="w-5 h-5" />
            </button>
        </div>
    ), { duration: 4000 });
};

const showAuthErrorToast = (message, errorType) => {
    let icon = AlertCircle;
    let borderColor = 'border-rose-100';
    let iconColor = 'text-rose-500';
    let title = 'Authentication Error';

    if (errorType === 'suspended') {
        icon = UserX;
        borderColor = 'border-amber-100';
        iconColor = 'text-amber-500';
        title = 'Account Suspended';
    } else if (errorType === 'role') {
        icon = Shield;
        borderColor = 'border-rose-100';
        iconColor = 'text-rose-500';
        title = 'Access Denied';
    }

    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex border ${borderColor}`}>
            <div className="flex-1 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                    <icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{message}</p>
                </div>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500 border-l border-gray-100">
                <X className="w-5 h-5" />
            </button>
        </div>
    ), { duration: 5000 });
};

export default function HealthRecordsPage() {
    const [activeCategory, setActiveCategory] = useState('All Records');
    const [view, setView] = useState('list');
    const [search, setSearch] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [familyId, setFamilyId] = useState(null);
    const [members, setMembers] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        memberId: '',
        documentName: '',
        documentType: 'lab_report',
        documentDate: '',
        notes: '',
        file: null,
    });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    useEffect(() => {
        fetchData();
    }, []);

    const handleAuthError = (error, defaultMessage) => {
        // Check for specific error types
        if (error.message?.includes('suspended') || error.message?.includes('Account suspended')) {
            showAuthErrorToast(
                error.reason || 'Your account has been suspended. Please contact support.',
                'suspended'
            );
            return;
        }
        if (error.message?.includes('role') || error.message?.includes('patient')) {
            showAuthErrorToast(
                'Only patients can access health records. Please contact support if you believe this is an error.',
                'role'
            );
            return;
        }
        if (error.status === 401) {
            showAuthErrorToast(
                'Please login to continue.',
                'auth'
            );
            return;
        }
        showErrorToast(error.message || defaultMessage);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const profileRes = await fetch('/api/user/profile');
            
            if (profileRes.status === 401) {
                showAuthErrorToast('Please login to continue.', 'auth');
                setLoading(false);
                return;
            }
            
            if (profileRes.status === 403) {
                const data = await profileRes.json();
                if (data.error?.includes('suspended')) {
                    showAuthErrorToast(data.reason || 'Your account has been suspended.', 'suspended');
                } else {
                    showAuthErrorToast('You do not have permission to access this page.', 'role');
                }
                setLoading(false);
                return;
            }

            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();

            if (profileData.user?.activeFamilyId) {
                const id = profileData.user.activeFamilyId._id || profileData.user.activeFamilyId;
                setFamilyId(id);

                const membersRes = await fetch(`/api/family/members?familyId=${id}`);
                if (membersRes.ok) {
                    const membersData = await membersRes.json();
                    setMembers(membersData.members || []);
                }

                await fetchRecords(id);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
            handleAuthError(err, 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecords = async (familyIdParam) => {
        try {
            const url = `/api/health-records?familyId=${familyIdParam || familyId}`;
            const recordsRes = await fetch(url);
            
            if (recordsRes.status === 401) {
                showAuthErrorToast('Please login to continue.', 'auth');
                return;
            }
            
            if (recordsRes.status === 403) {
                const data = await recordsRes.json();
                if (data.error?.includes('suspended')) {
                    showAuthErrorToast(data.reason || 'Your account has been suspended.', 'suspended');
                } else {
                    showAuthErrorToast('Only patients can access health records.', 'role');
                }
                return;
            }

            if (!recordsRes.ok) {
                const data = await recordsRes.json();
                throw new Error(data.error || 'Failed to fetch records');
            }
            
            const data = await recordsRes.json();
            setRecords(data.records || []);
        } catch (err) {
            console.error('Error fetching records:', err);
            handleAuthError(err, 'Failed to fetch records');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file) {
            showErrorToast('Please select a file');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', uploadForm.file);
            formData.append('familyId', familyId);
            formData.append('memberId', uploadForm.memberId);
            formData.append('documentName', uploadForm.documentName);
            formData.append('documentType', uploadForm.documentType);
            formData.append('documentDate', uploadForm.documentDate || new Date().toISOString().split('T')[0]);
            formData.append('notes', uploadForm.notes);

            const res = await fetch('/api/health-records/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.status === 401) {
                showAuthErrorToast('Please login to continue.', 'auth');
                return;
            }

            if (res.status === 403) {
                if (data.error?.includes('suspended')) {
                    showAuthErrorToast(data.reason || 'Your account has been suspended.', 'suspended');
                } else {
                    showAuthErrorToast('Only patients can upload health records.', 'role');
                }
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Failed to upload');

            showSuccessToast('Record uploaded successfully!');

            setUploadForm({
                memberId: '',
                documentName: '',
                documentType: 'lab_report',
                documentDate: '',
                notes: '',
                file: null,
            });
            setShowUploadModal(false);
            await fetchRecords();
        } catch (err) {
            console.error('Error uploading:', err);
            handleAuthError(err, 'Failed to upload record');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, title) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex flex-col border border-gray-100 overflow-hidden`}>
                <div className="p-5">
                    <p className="text-base font-bold text-gray-900">Delete Record?</p>
                    <p className="text-sm text-gray-500 mt-1">Are you sure you want to delete "{title}"? This action cannot be undone.</p>
                </div>
                <div className="flex border-t border-gray-100 bg-slate-50">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-slate-100 transition-colors border-r border-gray-100 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await fetch(`/api/health-records/${id}`, { method: 'DELETE' });
                                
                                if (res.status === 401) {
                                    showAuthErrorToast('Please login to continue.', 'auth');
                                    return;
                                }
                                
                                if (res.status === 403) {
                                    const data = await res.json();
                                    if (data.error?.includes('suspended')) {
                                        showAuthErrorToast(data.reason || 'Your account has been suspended.', 'suspended');
                                    } else {
                                        showAuthErrorToast('Only patients can delete health records.', 'role');
                                    }
                                    return;
                                }

                                if (!res.ok) {
                                    const data = await res.json();
                                    throw new Error(data.error || 'Delete failed');
                                }
                                
                                showSuccessToast('Record deleted successfully');
                                await fetchRecords();
                            } catch (e) {
                                handleAuthError(e, 'Failed to delete record');
                            }
                        }}
                        className="flex-1 py-3 text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const handleView = (record) => {
        if (record.fileUrl) {
            window.open(record.fileUrl, '_blank');
        } else {
            showErrorToast('File URL not available');
        }
    };

    const handleDownload = (record) => {
        if (record.fileUrl) {
            const link = document.createElement('a');
            link.href = record.fileUrl;
            link.setAttribute('download', record.title || 'record');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            showErrorToast('Download link not available');
        }
    };

    const handleShare = async (fileUrl, title) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Health Record - ${title}`,
                    text: `Check out this health record: ${title}`,
                    url: fileUrl,
                });
            } else {
                await navigator.clipboard.writeText(fileUrl);
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex border border-blue-100`}>
                        <div className="flex-1 p-4 flex items-center gap-3">
                            <Copy className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm font-bold text-gray-900">Link copied to clipboard!</p>
                        </div>
                        <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500 border-l border-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ), { duration: 3000 });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                try {
                    await navigator.clipboard.writeText(fileUrl);
                    showSuccessToast('Link copied to clipboard!');
                } catch (clipError) {
                    showErrorToast('Failed to share');
                }
            }
        }
    };

    const filtered = records.filter((r) => {
        const matchCat =
            activeCategory === 'All Records' || r.category === activeCategory.replace(/s$/, '');
        const matchSearch =
            search === '' ||
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.member.toLowerCase().includes(search.toLowerCase()) ||
            r.doctor.toLowerCase().includes(search.toLowerCase()) ||
            r.date.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <Sidebar />
                <main className="md:pl-[280px]">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-gray-500 text-sm font-medium">Loading records...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Toaster position="top-right" />
            <Sidebar />

            <main className="md:pl-[280px] pt-16 md:pt-0">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#E2E8F0]">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E40AF] text-xs font-bold rounded-full tracking-wider uppercase">
                                Health Vault
                              </span>
                            <h1 className="text-3xl font-bold text-[#111827] mt-3 tracking-tight font-sans">Health Records</h1>
                            <p className="text-sm text-[#475569] mt-1 font-medium">
                                Manage and monitor your family's medical documents securely.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Record
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm flex items-center justify-between font-medium">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Search & Actions Bar */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by document name, doctor, or date..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-[#111827]"
                            />
                        </div>

                    </div>

                    {/* Categories Selector Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4.5 py-2 rounded-full text-xs font-bold transition border cursor-pointer ${activeCategory === cat
                                        ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-sm'
                                        : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Meta count bar & view selectors */}
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">{filtered.length} records found</p>

                    </div>

                    {/* Records List Container */}
                    <div className="space-y-4">
                        {filtered.length === 0 && (
                            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm px-6 py-12 text-center text-[#475569] text-sm font-semibold">
                                {records.length === 0 ? 'No records uploaded yet. Upload your first medical document!' : 'No records found matching filters.'}
                            </div>
                        )}
                        {filtered.map((record) => (
                            <div
                                key={record.id}
                                className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-blue-300 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <RecordIcon type={record.type} />
                                    <div className="min-w-0">
                                        <span className="inline-block text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                                            {record.category}
                                        </span>
                                        <h4 className="text-base font-bold text-[#111827] leading-tight truncate">
                                            {record.title}
                                        </h4>
                                        <p className="text-xs text-[#475569] mt-1 font-semibold flex items-center gap-2">
                                            <span>{record.member}</span>
                                            <span className="text-[#E2E8F0]">&middot;</span>
                                            <span>{record.date}</span>
                                        </p>
                                        <p className="text-xs text-[#475569]/80 mt-0.5 font-medium">{record.doctor}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 border-t border-[#E2E8F0] sm:border-0 pt-4 sm:pt-0 justify-end">
                                    <button
                                        onClick={() => handleView(record)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#111827] hover:bg-slate-50 transition border border-[#E2E8F0] cursor-pointer"
                                        title="View document"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(record)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#111827] hover:bg-slate-50 transition border border-[#E2E8F0] cursor-pointer"
                                        title="Download document"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare(record.fileUrl, record.title)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#111827] hover:bg-slate-50 transition border border-[#E2E8F0] cursor-pointer"
                                        title="Share document"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.id, record.title)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition border border-rose-100 cursor-pointer"
                                        title="Delete document"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0]">
                        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-bold text-[#111827]">Upload Health Record</h3>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="p-1.5 rounded-full hover:bg-slate-50 transition cursor-pointer"
                            >
                                <X className="w-5 h-5 text-[#475569]" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-5">
                            {/* Form fields remain the same */}
                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Family Member *</label>
                                <select
                                    required
                                    value={uploadForm.memberId}
                                    onChange={(e) => setUploadForm({ ...uploadForm, memberId: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white"
                                >
                                    <option value="">Select a member</option>
                                    {members.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.name} {m.isPrimary ? '(You)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Document Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.documentName}
                                    onChange={(e) => setUploadForm({ ...uploadForm, documentName: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] placeholder-gray-400 bg-white"
                                    placeholder="e.g., Blood Test Results"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Document Type *</label>
                                <select
                                    required
                                    value={uploadForm.documentType}
                                    onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white"
                                >
                                    <option value="lab_report">Lab Report</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="xray_scan">X-Ray / Scan</option>
                                    <option value="vaccination">Vaccination Record</option>
                                    <option value="insurance">Insurance Document</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Document Date</label>
                                <input
                                    type="date"
                                    value={uploadForm.documentDate}
                                    onChange={(e) => setUploadForm({ ...uploadForm, documentDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">File * (JPEG, PNG, PDF - Max 10MB)</label>
                                <input
                                    type="file"
                                    required
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Notes (optional)</label>
                                <textarea
                                    value={uploadForm.notes}
                                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] placeholder-gray-400 bg-white"
                                    placeholder="Additional notes about this document..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-5 py-2.5 border border-[#E2E8F0] hover:bg-slate-50 text-[#111827] text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {uploading ? 'Uploading...' : 'Upload Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}