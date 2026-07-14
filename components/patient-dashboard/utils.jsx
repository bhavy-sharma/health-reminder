import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, X, AlertCircle, UserX, Shield } from 'lucide-react';

export const Toast = {
    success: (msg) => toast.custom(t => (
        <div className={`${t.visible?'animate-enter':'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl flex border border-emerald-100`}>
            <div className="flex-1 p-4 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /><p className="text-sm font-bold text-gray-900">{msg}</p></div>
            <button onClick={() => toast.dismiss(t.id)} className="p-4 text-gray-400 hover:text-gray-500 border-l border-gray-100"><X className="w-5 h-5" /></button>
        </div>
    ), { duration: 3000 }),
    error: (msg) => toast.custom(t => (
        <div className={`${t.visible?'animate-enter':'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl flex border border-rose-100`}>
            <div className="flex-1 p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" /><p className="text-sm font-bold text-gray-900">{msg}</p></div>
            <button onClick={() => toast.dismiss(t.id)} className="p-4 text-gray-400 hover:text-gray-500 border-l border-gray-100"><X className="w-5 h-5" /></button>
        </div>
    ), { duration: 4000 }),
    auth: (msg, type) => {
        const isSuspended = type === 'suspended';
        const Icon = isSuspended ? UserX : Shield;
        const border = isSuspended ? 'border-amber-100' : 'border-rose-100';
        const color = isSuspended ? 'text-amber-500' : 'text-rose-500';
        const title = isSuspended ? 'Account Suspended' : 'Access Denied';
        toast.custom(t => (
            <div className={`${t.visible?'animate-enter':'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl flex border ${border}`}>
                <div className="flex-1 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0"><Icon className={`w-5 h-5 ${color}`} /></div>
                    <div><p className="text-sm font-bold text-gray-900">{title}</p><p className="text-xs text-gray-600 mt-0.5">{msg}</p></div>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="p-4 text-gray-400 hover:text-gray-500 border-l border-gray-100"><X className="w-5 h-5" /></button>
            </div>
        ), { duration: 5000 });
    },
    confirmDelete: (title, onConfirm) => {
        toast.custom(t => (
            <div className={`${t.visible?'animate-enter':'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-2xl flex flex-col border border-gray-100 overflow-hidden`}>
                <div className="p-5"><p className="text-base font-bold text-gray-900">Delete Record?</p><p className="text-sm text-gray-500 mt-1">Are you sure you want to delete "{title}"? This cannot be undone.</p></div>
                <div className="flex border-t border-gray-100 bg-slate-50">
                    <button onClick={() => toast.dismiss(t.id)} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-slate-100 border-r border-gray-100">Cancel</button>
                    <button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="flex-1 py-3 text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50">Delete</button>
                </div>
            </div>
        ), { duration: 6000 });
    }
};

export const handleShare = async (url, title) => {
    try {
        if (navigator.share) await navigator.share({ title: `Health Record - ${title}`, text: `Check out: ${title}`, url });
        else { await navigator.clipboard.writeText(url); Toast.success('Link copied!'); }
    } catch (err) { if (err.name !== 'AbortError') Toast.error('Failed to share'); }
};
