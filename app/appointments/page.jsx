// app/patient/appointments/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    Star,
    ChevronRight,
    Loader2,
    AlertCircle,
    X,
    Check,
    Clock as ClockIcon,
    MessageCircle,
    Phone,
} from 'lucide-react';
import Sidebar from '@/components/patient-dashboard/Sidebar';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

function getColorClass(hex) {
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
}

function StatusBadge({ status }) {
    switch (status) {
        case 'confirmed':
            return (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Check className="w-3 h-3" /> Confirmed
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <ClockIcon className="w-3 h-3" /> Pending
                </span>
            );
        case 'completed':
            return (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    <Check className="w-3 h-3" /> Completed
                </span>
            );
        case 'cancelled':
            return (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                    <X className="w-3 h-3" /> Cancelled
                </span>
            );
        case 'no-show':
            return (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                    <X className="w-3 h-3" /> No Show
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                    {status}
                </span>
            );
    }
}

export default function PatientAppointments() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [counts, setCounts] = useState({ all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                status: statusFilter,
            });

            const response = await fetch(`/api/patient/appointments?${params}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch appointments');
            }

            if (result.success) {
                setAppointments(result.data.appointments || []);
                setCounts(result.data.counts || { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
            } else {
                throw new Error(result.error || 'Failed to load appointments');
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getWhatsAppLink = (phone) => {
        const number = phone?.replace(/[^0-9]/g, '') || '';
        return `https://wa.me/91${number}`;
    };

    const statusTabs = [
        { id: 'all', label: 'All', count: counts.all },
        { id: 'pending', label: 'Pending', count: counts.pending },
        { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
        { id: 'completed', label: 'Completed', count: counts.completed },
        { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF8F5]">
                <Sidebar />
                <main className="md:pl-[280px]">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-[#0D1B2A] animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">Loading appointments...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FAF8F5]">
                <Sidebar />
                <main className="md:pl-[280px]">
                    <div className="flex items-center justify-center h-screen p-4">
                        <div className="text-center max-w-md">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Appointments</h3>
                            <p className="text-sm text-gray-500 mb-4">{error}</p>
                            <button 
                                onClick={fetchAppointments}
                                className="px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44]"
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
        <div className="min-h-screen bg-[#FAF8F5]">
            <Toaster position="top-right" />
            <Sidebar />

            <main className="md:pl-[280px]">
                <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 pt-16 md:pt-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">My Appointments</h1>
                            <p className="text-gray-500 text-sm">
                                {counts.confirmed} confirmed · {counts.pending} pending
                            </p>
                        </div>
                        <Link
                            href="/find-doctors"
                            className="bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1a2e44] transition-colors flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Book New Appointment
                        </Link>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-100">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                    statusFilter === tab.id
                                        ? 'bg-[#0D1B2A] text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
                                        statusFilter === tab.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Appointments List */}
                    {appointments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                You don't have any {statusFilter !== 'all' ? statusFilter : ''} appointments.
                            </p>
                            <Link
                                href="/find-doctors"
                                className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1a2e44] transition-colors"
                            >
                                Find a Doctor
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    onClick={() => setSelectedAppointment(apt)}
                                    className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all cursor-pointer ${
                                        selectedAppointment?.id === apt.id
                                            ? 'border-[#0D1B2A]'
                                            : 'border-gray-100'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Doctor Avatar */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-full ${getColorClass(apt.doctorColor)} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                                                {apt.doctorInitials}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{apt.doctorName}</h3>
                                                <p className="text-sm text-gray-500">{apt.doctorSpecialty}</p>
                                            </div>
                                        </div>

                                        {/* Appointment Details */}
                                        <div className="flex flex-wrap items-center gap-4 md:ml-auto">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {apt.date}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {apt.time}
                                            </div>
                                            {/* ─── Appointment Type Badge ─── */}
                                            <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                                                apt.isVideo 
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                                            }`}>
                                                {apt.isVideo ? (
                                                    <Video className="w-3 h-3" />
                                                ) : (
                                                    <MapPin className="w-3 h-3" />
                                                )}
                                                {apt.isVideo ? 'Video' : 'In-Person'}
                                            </div>
                                            <StatusBadge status={apt.status} />
                                        </div>
                                    </div>

                                    {/* Condition */}
                                    {apt.condition && (
                                        <div className="mt-3 pt-3 border-t border-gray-50">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Condition:</span> {apt.condition}
                                            </p>
                                        </div>
                                    )}

                                    {/* ─── Action Buttons ─── */}
                                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                                            {/* WhatsApp Button */}
                                            {apt.doctorPhone && (
                                                <a
                                                    href={getWhatsAppLink(apt.doctorPhone)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#20bd5a] transition-colors"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    WhatsApp Doctor
                                                </a>
                                            )}
                                            {/* Call Button */}
                                            {apt.doctorPhone && (
                                                <a
                                                    href={`tel:+91${apt.doctorPhone.replace(/[^0-9]/g, '')}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                    Call Doctor
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}