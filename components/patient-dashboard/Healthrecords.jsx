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
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const categories = ['All Records', 'Lab Reports', 'Prescriptions', 'Scans', 'Vaccinations', 'Doctor Notes'];

const iconConfig = {
    lab: { bg: 'bg-red-50', icon: FileText, color: 'text-red-500' },
    prescription: { bg: 'bg-blue-50', icon: ClipboardList, color: 'text-blue-500' },
    scan: { bg: 'bg-purple-50', icon: Scan, color: 'text-purple-500' },
};

function RecordIcon({ type }) {
    const cfg = iconConfig[type] ?? iconConfig.lab;
    const Icon = cfg.icon;
    return (
        <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${cfg.color}`} />
        </div>
    );
}

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

    // Get cloud name from env
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const profileRes = await fetch('/api/user/profile');
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
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecords = async (familyIdParam) => {
        try {
            const url = `/api/health-records?familyId=${familyIdParam || familyId}`;
            const recordsRes = await fetch(url);
            if (!recordsRes.ok) throw new Error('Failed to fetch records');
            const data = await recordsRes.json();
            setRecords(data.records || []);
        } catch (err) {
            console.error('Error fetching records:', err);
            toast.error('Failed to fetch records');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file) {
            toast.error('Please select a file');
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
            if (!res.ok) throw new Error(data.error || 'Failed to upload');

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">Record uploaded successfully!</p>
                    </div>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ), { duration: 3000 });

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
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">{err.message || 'Failed to upload record'}</p>
                    </div>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ), { duration: 4000 });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, title) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 p-4">
                    <div className="flex items-start">
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Delete Record?</p>
                            <p className="text-sm text-gray-500 mt-1">Are you sure you want to delete "{title}"? This action cannot be undone.</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await fetch(`/api/health-records/${id}`, { method: 'DELETE' });
                                if (!res.ok) throw new Error('Failed to delete');

                                toast.custom((t2) => (
                                    <div className={`${t2.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                                        <div className="flex-1 p-4 flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <p className="text-sm font-medium text-gray-900">Record deleted successfully</p>
                                        </div>
                                        <button
                                            onClick={() => toast.dismiss(t2.id)}
                                            className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ), { duration: 3000 });

                                await fetchRecords();
                            } catch (err) {
                                console.error('Error deleting:', err);
                                toast.custom((t2) => (
                                    <div className={`${t2.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                                        <div className="flex-1 p-4 flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <p className="text-sm font-medium text-gray-900">Failed to delete record</p>
                                        </div>
                                        <button
                                            onClick={() => toast.dismiss(t2.id)}
                                            className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ), { duration: 4000 });
                            }
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleView = (record) => {
        if (!record.fileUrl) {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">No file available to view</p>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ), { duration: 3000 });
            return;
        }

        // For PDFs, use the raw URL WITHOUT fl_attachment (for viewing)
        let viewUrl = record.fileUrl;

        // If it's a PDF, use raw resource type without fl_attachment
        if (record.mimeType === 'application/pdf' || record.fileUrl.includes('.pdf')) {
            const publicId = record.filePublicId;
            if (publicId && cloudName) {
                // Remove fl_attachment for viewing - just show the PDF
                viewUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`;
            }
        }

        window.open(viewUrl, '_blank');
    };

    const handleDownload = async (record) => {
        try {
            let downloadUrl = record.fileUrl;
            let fileName = record.documentName || 'document';

            // For PDFs, use raw resource type with fl_attachment flag
            if (record.mimeType === 'application/pdf' || record.fileUrl.includes('.pdf')) {
                const publicId = record.filePublicId;
                if (publicId && cloudName) {
                    downloadUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${publicId}`;
                }
            } else {
                // For images, use fl_attachment to force download
                const publicId = record.filePublicId;
                if (publicId && cloudName) {
                    downloadUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${publicId}`;
                }
            }

            // Fetch the file
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Failed to download file');

            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Add appropriate file extension
            if (record.mimeType === 'application/pdf') {
                a.download = `${fileName}.pdf`;
            } else if (record.mimeType?.includes('image')) {
                const ext = record.mimeType.split('/')[1] || 'jpg';
                a.download = `${fileName}.${ext}`;
            } else {
                a.download = fileName;
            }

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">Download started</p>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ), { duration: 3000 });
        } catch (error) {
            console.error('Download error:', error);
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">Failed to download file</p>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ), { duration: 4000 });
        }
    };

    const handleShare = async (fileUrl, title) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title || 'Health Record',
                    text: `Check out this health record: ${title}`,
                    url: fileUrl,
                });
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 p-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-900">Shared successfully</p>
                        </div>
                        <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ), { duration: 3000 });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(fileUrl);
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 p-4 flex items-center gap-3">
                            <Copy className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-900">Link copied to clipboard!</p>
                        </div>
                        <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ), { duration: 3000 });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                // Fallback: copy to clipboard
                try {
                    await navigator.clipboard.writeText(fileUrl);
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                            <div className="flex-1 p-4 flex items-center gap-3">
                                <Copy className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <p className="text-sm font-medium text-gray-900">Link copied to clipboard!</p>
                            </div>
                            <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ), { duration: 3000 });
                } catch (clipError) {
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                            <div className="flex-1 p-4 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm font-medium text-gray-900">Failed to share</p>
                            </div>
                            <button onClick={() => toast.dismiss(t.id)} className="p-4 flex items-center justify-center text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ), { duration: 4000 });
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
            <div className="min-h-screen bg-[#FAF9F6]">
                <Sidebar />
                <main className="md:pl-[280px]">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            <p className="text-gray-500">Loading records...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#333',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '12px',
                        padding: '0',
                    },
                }}
            />
            <Sidebar />

            <main className="md:pl-[280px]">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-serif text-gray-900 tracking-tight">Health Records</h1>
                            <p className="text-gray-500 mt-1.5 text-[15px]">
                                Manage your family's medical documents
                            </p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors shrink-0"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Record
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Search + Filter */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by document name, doctor, or date..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filter
                        </button>
                    </div>

                    {/* Category tabs */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === cat
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Results bar + view toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">{filtered.length} records found</p>
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setView('list')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                List View
                            </button>
                            <button
                                onClick={() => setView('timeline')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'timeline' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Timeline
                            </button>
                        </div>
                    </div>

                    {/* Records list */}
                    <div className="space-y-3">
                        {filtered.length === 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-12 text-center text-gray-400 text-sm">
                                {records.length === 0 ? 'No records uploaded yet. Upload your first record!' : 'No records match your search.'}
                            </div>
                        )}
                        {filtered.map((record) => (
                            <div
                                key={record.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-5"
                            >
                                <RecordIcon type={record.type} />

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                                        {record.category}
                                    </p>
                                    <p className="text-[16px] font-semibold text-gray-900 leading-snug">
                                        {record.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {record.member} &middot; {record.date}
                                    </p>
                                    <p className="text-sm text-gray-400">{record.doctor}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleView(record)}
                                        aria-label="View"
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                        title="View document"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(record)}
                                        aria-label="Download"
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                        title="Download document"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare(record.fileUrl, record.title)}
                                        aria-label="Share"
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                        title="Share document"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.id, record.title)}
                                        aria-label="Delete"
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-serif text-gray-900">Upload Health Record</h3>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Family Member *</label>
                                <select
                                    required
                                    value={uploadForm.memberId}
                                    onChange={(e) => setUploadForm({ ...uploadForm, memberId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.documentName}
                                    onChange={(e) => setUploadForm({ ...uploadForm, documentName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                                    placeholder="e.g., Blood Test Results"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                                <select
                                    required
                                    value={uploadForm.documentType}
                                    onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Date</label>
                                <input
                                    type="date"
                                    value={uploadForm.documentDate}
                                    onChange={(e) => setUploadForm({ ...uploadForm, documentDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File * (JPEG, PNG, PDF - Max 10MB)</label>
                                <input
                                    type="file"
                                    required
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                <textarea
                                    value={uploadForm.notes}
                                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                                    placeholder="Additional notes about this document..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
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