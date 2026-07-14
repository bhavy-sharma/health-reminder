'use client';

import React, { useState, useEffect } from 'react';
import {
    Upload, Search, Eye, Download, Share2, Trash2, FileText,
    ClipboardList, Scan, X, Loader2, CheckCircle, AlertCircle,
    Copy, Shield, UserX, HardDrive, Zap
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Link from 'next/link';
import { Toast, handleShare } from './utils';

const categories = ['All Records', 'Lab Reports', 'Prescriptions', 'Scans', 'Vaccinations', 'Doctor Notes'];

const iconConfig = {
    lab: { bg: 'bg-rose-50', icon: FileText, color: 'text-rose-600' },
    prescription: { bg: 'bg-blue-50', icon: ClipboardList, color: 'text-blue-600' },
    scan: { bg: 'bg-purple-50', icon: Scan, color: 'text-purple-600' },
};

const RecordIcon = ({ type }) => {
    const cfg = iconConfig[type] ?? iconConfig.lab;
    const Icon = cfg.icon;
    return (
        <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 shadow-sm`}>
            <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
    );
};



export default function HealthRecordsPage() {
    const [activeCategory, setActiveCategory] = useState('All Records');
    const [search, setSearch] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [familyId, setFamilyId] = useState(null);
    const [members, setMembers] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({ memberId: '', documentName: '', documentType: 'lab_report', documentDate: '', doctorName: '', hospitalName: '', notes: '', file: null });
    const [storage, setStorage] = useState({ used: 0, limit: 1, remaining: 1, percentageUsed: 0, isFull: false, plan: 'free' });

    useEffect(() => { fetchData(); }, []);

    const handleAuthError = (err, defaultMsg) => {
        if (err.message?.includes('suspended')) return Toast.auth(err.reason || 'Account suspended.', 'suspended');
        if (err.message?.includes('role') || err.message?.includes('patient')) return Toast.auth('Only patients can access health records.', 'role');
        if (err.status === 401) return Toast.auth('Please login to continue.', 'auth');
        Toast.error(err.message || defaultMsg);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const profileRes = await fetch('/api/user/profile');
            if (profileRes.status === 401) { Toast.auth('Please login.', 'auth'); setLoading(false); return; }
            if (profileRes.status === 403) {
                const d = await profileRes.json();
                Toast.auth(d.error?.includes('suspended') ? d.reason || 'Account suspended.' : 'Access denied.', d.error?.includes('suspended') ? 'suspended' : 'role');
                setLoading(false); return;
            }
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();
            await fetchStorageInfo();
            if (profileData.user?.activeFamilyId) {
                const id = profileData.user.activeFamilyId._id || profileData.user.activeFamilyId;
                setFamilyId(id);
                const membersRes = await fetch(`/api/family/members?familyId=${id}`);
                if (membersRes.ok) setMembers((await membersRes.json()).members || []);
                await fetchRecords(id);
            }
        } catch (err) { setError(err.message); handleAuthError(err, 'Failed to load'); }
        finally { setLoading(false); }
    };

    const fetchStorageInfo = async () => {
        try {
            const res = await fetch('/api/user/storage', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
            if (res.ok) {
                const d = await res.json();
                if (d.success) setStorage({
                    used: d.data.storageUsed || 0,
                    limit: d.data.storageLimit || 1,
                    remaining: d.data.remainingStorage || 1,
                    percentageUsed: d.data.percentageUsed || 0,
                    isFull: d.data.isFull || false,
                    plan: d.data.plan || 'free'
                });
            }
        } catch (err) { console.error('Storage error:', err); }
    };

    const fetchRecords = async (fid) => {
        try {
            const res = await fetch(`/api/health-records?familyId=${fid || familyId}`);
            if (res.status === 401) return Toast.auth('Please login.', 'auth');
            if (res.status === 403) {
                const d = await res.json();
                return Toast.auth(d.error?.includes('suspended') ? d.reason || 'Account suspended.' : 'Only patients can access.', d.error?.includes('suspended') ? 'suspended' : 'role');
            }
            if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch');
            setRecords((await res.json()).records || []);
        } catch (err) { handleAuthError(err, 'Failed to fetch records'); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file) return Toast.error('Please select a file');
        if (storage.isFull) return Toast.error(`Storage full (${storage.used.toFixed(2)} GB / ${storage.limit} GB). Upgrade or delete files.`);
        const fileSizeGB = uploadForm.file.size / (1024 * 1024 * 1024);
        if (fileSizeGB > storage.remaining) return Toast.error(`Not enough space. Need ${fileSizeGB.toFixed(2)} GB, have ${storage.remaining.toFixed(2)} GB.`);
        try {
            setUploading(true);
            const fd = new FormData();
            fd.append('file', uploadForm.file);
            fd.append('familyId', familyId);
            fd.append('memberId', uploadForm.memberId);
            fd.append('documentName', uploadForm.documentName);
            fd.append('documentType', uploadForm.documentType);
            fd.append('documentDate', uploadForm.documentDate || new Date().toISOString().split('T')[0]);
            if (uploadForm.doctorName) fd.append('doctorName', uploadForm.doctorName);
            if (uploadForm.hospitalName) fd.append('hospitalName', uploadForm.hospitalName);
            fd.append('notes', uploadForm.notes);
            const res = await fetch('/api/health-records/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.status === 401) return Toast.auth('Please login.', 'auth');
            if (res.status === 403) return Toast.auth(data.error?.includes('suspended') ? data.reason || 'Account suspended.' : 'Only patients can upload.', data.error?.includes('suspended') ? 'suspended' : 'role');
            if (res.status === 413 && data.code === 'STORAGE_LIMIT_EXCEEDED') return Toast.error(data.message || 'Storage limit exceeded.');
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            Toast.success('Record uploaded!');
            await fetchStorageInfo();
            setUploadForm({ memberId: '', documentName: '', documentType: 'lab_report', documentDate: '', doctorName: '', hospitalName: '', notes: '', file: null });
            setShowUploadModal(false);
            await fetchRecords();
        } catch (err) { handleAuthError(err, 'Upload failed'); }
        finally { setUploading(false); }
    };

    const handleDelete = (id, title) => {
        Toast.confirmDelete(title, async () => {
            try {
                const res = await fetch(`/api/health-records/${id}`, { method: 'DELETE' });
                if (res.status === 401) return Toast.auth('Please login.', 'auth');
                if (res.status === 403) {
                    const d = await res.json();
                    return Toast.auth(d.error?.includes('suspended') ? d.reason || 'Account suspended.' : 'Only patients can delete.', d.error?.includes('suspended') ? 'suspended' : 'role');
                }
                if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
                Toast.success('Record deleted');
                await fetchStorageInfo();
                await fetchRecords();
            } catch (err) { handleAuthError(err, 'Delete failed'); }
        });
    };

    const handleView = (r) => r.fileUrl ? window.open(r.fileUrl, '_blank') : Toast.error('File URL not available');
    const handleDownload = (r) => {
        if (!r.fileUrl) return Toast.error('Download not available');
        const link = document.createElement('a');
        link.href = r.fileUrl;
        link.download = r.title || 'record';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const filtered = records.filter(r => {
        const matchCat = activeCategory === 'All Records' || r.category === activeCategory.replace(/s$/, '');
        const matchSearch = !search || [r.title, r.member, r.doctor, r.date].some(f => f?.toLowerCase().includes(search.toLowerCase()));
        return matchCat && matchSearch;
    });

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC]"><Sidebar /><main className="md:pl-[280px]"><div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /><p className="text-gray-500 text-sm font-medium ml-3">Loading...</p></div></main></div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Toaster position="top-right" />
            <Sidebar />
            <main className="md:pl-[280px] pt-16 md:pt-0">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#E2E8F0]">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E40AF] text-xs font-bold rounded-full tracking-wider uppercase">Health Vault</span>
                            <h1 className="text-3xl font-bold text-[#111827] mt-3 tracking-tight">Health Records</h1>
                            <p className="text-sm text-[#475569] mt-1">Manage your family's medical documents securely.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 shadow-sm">
                                <HardDrive className="w-4 h-4 text-[#475569]" />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium text-[#475569]">{storage.used.toFixed(2)} GB / {storage.limit} GB</span>
                                        <span className={`text-[10px] font-bold ${storage.percentageUsed > 90 ? 'text-red-500' : storage.percentageUsed > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>({storage.percentageUsed.toFixed(2)}%)</span>
                                    </div>
                                    <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${storage.percentageUsed > 90 ? 'bg-red-500' : storage.percentageUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(storage.percentageUsed, 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowUploadModal(true)} disabled={storage.isFull} className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md ${storage.isFull ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-4 h-4" /> Upload Record
                            </button>
                        </div>
                    </div>

                    {/* Warnings */}
                    {storage.isFull && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center justify-between">
                            <span className="font-medium">Storage full! Used {storage.used.toFixed(2)} GB of {storage.limit} GB.</span>
                            <Link href="/pricing" className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Upgrade</Link>
                        </div>
                    )}
                    {!storage.isFull && storage.percentageUsed > 80 && (
                        <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-amber-700 text-xs flex items-center justify-between">
                            <span>Used {storage.used.toFixed(2)} GB of {storage.limit} GB ({storage.percentageUsed.toFixed(0)}%). Consider upgrading.</span>
                            <Link href="/pricing" className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Upgrade</Link>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search by document name, doctor, or date..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 text-[#111827]" />
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(c => (
                            <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeCategory === c ? 'bg-[#0B1F4D] text-white border-[#0B1F4D]' : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50'}`}>{c}</button>
                        ))}
                    </div>

                    <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">{filtered.length} records found</p>

                    {/* Records List */}
                    <div className="space-y-4">
                        {filtered.length === 0 && (
                            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm px-6 py-12 text-center text-[#475569] text-sm">
                                {records.length === 0 ? 'No records uploaded yet. Upload your first medical document!' : 'No records found matching filters.'}
                            </div>
                        )}
                        {filtered.map(r => (
                            <div key={r.id} className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-blue-300 transition">
                                <div className="flex items-center gap-4">
                                    <RecordIcon type={r.type} />
                                    <div>
                                        <span className="inline-block text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">{r.category}</span>
                                        <h4 className="text-base font-bold text-[#111827] leading-tight truncate">{r.title}</h4>
                                        <p className="text-xs text-[#475569] mt-1 font-semibold flex items-center gap-2"><span>{r.member}</span><span className="text-[#E2E8F0]">&middot;</span><span>{r.date}</span></p>
                                        <p className="text-xs text-[#475569]/80 mt-0.5 font-medium">{r.doctor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 border-t border-[#E2E8F0] sm:border-0 pt-4 sm:pt-0 justify-end">
                                    <button onClick={() => handleView(r)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#111827] hover:bg-slate-50 border border-[#E2E8F0]"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => handleDownload(r)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#111827] hover:bg-slate-50 border border-[#E2E8F0]"><Download className="w-4 h-4" /></button>
                                    <button onClick={() => handleShare(r.fileUrl, r.title)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#111827] hover:bg-slate-50 border border-[#E2E8F0]"><Share2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(r.id, r.title)} className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-100"><Trash2 className="w-4 h-4" /></button>
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
                        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#111827]">Upload Health Record</h3>
                            <button onClick={() => setShowUploadModal(false)} className="p-1.5 rounded-full hover:bg-slate-50"><X className="w-5 h-5 text-[#475569]" /></button>
                        </div>
                        <div className="px-6 pt-4 pb-2">
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700 font-medium">Storage Available</span>
                                    <span className={`font-bold ${storage.percentageUsed > 90 ? 'text-red-500' : storage.percentageUsed > 70 ? 'text-amber-500' : 'text-blue-700'}`}>{storage.remaining.toFixed(2)} GB remaining</span>
                                </div>
                                <div className="w-full h-1.5 bg-blue-100 rounded-full mt-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full ${storage.percentageUsed > 90 ? 'bg-red-500' : storage.percentageUsed > 70 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(storage.percentageUsed, 100)}%` }} />
                                </div>
                                <p className="text-[10px] text-blue-600 mt-1">{storage.used.toFixed(2)} GB used of {storage.limit} GB ({storage.percentageUsed.toFixed(0)}%)</p>
                            </div>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Family Member *</label>
                                <select required value={uploadForm.memberId} onChange={(e) => setUploadForm({ ...uploadForm, memberId: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white">
                                    <option value="">Select a member</option>
                                    {members.map(m => <option key={m._id} value={m._id}>{m.name} {m.isPrimary ? '(You)' : ''}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Document Name *</label>
                                <input type="text" required value={uploadForm.documentName} onChange={(e) => setUploadForm({ ...uploadForm, documentName: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white placeholder-gray-400" placeholder="e.g., Blood Test Results" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Document Type *</label>
                                <select required value={uploadForm.documentType} onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white">
                                    <option value="lab_report">Lab Report</option><option value="prescription">Prescription</option>
                                    <option value="xray_scan">X-Ray / Scan</option><option value="vaccination">Vaccination Record</option>
                                    <option value="insurance">Insurance Document</option><option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Document Date</label>
                                <input type="date" value={uploadForm.documentDate} onChange={(e) => setUploadForm({ ...uploadForm, documentDate: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Doctor Name (Optional)</label>
                                    <input type="text" value={uploadForm.doctorName} onChange={(e) => setUploadForm({ ...uploadForm, doctorName: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white placeholder-gray-400" placeholder="e.g., John Doe" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Hospital/Clinic (Optional)</label>
                                    <input type="text" value={uploadForm.hospitalName} onChange={(e) => setUploadForm({ ...uploadForm, hospitalName: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white placeholder-gray-400" placeholder="e.g., City Hospital" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">File * (JPEG, PNG, PDF - Max 10MB)</label>
                                <input type="file" required accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadForm.file && <p className="text-xs text-gray-400 mt-1">Size: {(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Notes (optional)</label>
                                <textarea value={uploadForm.notes} onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })} rows="3" className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#111827] bg-white placeholder-gray-400" placeholder="Additional notes..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                                <button type="button" onClick={() => setShowUploadModal(false)} className="px-5 py-2.5 border border-[#E2E8F0] hover:bg-slate-50 text-[#111827] text-xs font-bold rounded-xl">Cancel</button>
                                <button type="submit" disabled={uploading || storage.isFull} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2">
                                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}{uploading ? 'Uploading...' : storage.isFull ? 'Storage Full' : 'Upload Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}