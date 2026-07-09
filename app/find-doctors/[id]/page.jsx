// app/find-doctors/[id]/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Star, MapPin, Clock, BadgeCheck, Stethoscope, Award,
    GraduationCap, Languages, Calendar, Video, DollarSign, Loader2,
    AlertCircle, Check, MessageCircle, Phone, X, Users, ThumbsUp, Zap, Crown
} from 'lucide-react';
import Sidebar from '@/components/patient-dashboard/Sidebar';

// ── Constants ──────────────────────────────────────────────
const colorMap = {
    '#EF4444': 'bg-red-500', '#F59E0B': 'bg-amber-500', '#10B981': 'bg-emerald-500',
    '#3B82F6': 'bg-blue-500', '#8B5CF6': 'bg-purple-500', '#EC4899': 'bg-pink-500',
    '#14B8A6': 'bg-teal-500', '#F97316': 'bg-orange-500', '#6366F1': 'bg-indigo-500',
    '#84CC16': 'bg-lime-500', '#06B6D4': 'bg-cyan-500', '#D946EF': 'bg-fuchsia-500',
    '#6B7280': 'bg-gray-500',
};
const getColorClass = (hex) => colorMap[hex] || 'bg-gray-500';

function StarRating({ rating, size = "w-4 h-4" }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`${size} ${s <= Math.floor(rating)
                    ? 'text-amber-400 fill-amber-400'
                    : s - 0.5 <= rating ? 'text-amber-400 fill-amber-200' : 'text-gray-200 fill-gray-200'}`} />
            ))}
        </div>
    );
}

// ── Modals ──────────────────────────────────────────────────
const ErrorModal = ({ isOpen, onClose, title, message, icon: Icon }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="flex flex-col items-center text-center py-4">
                    {Icon && <Icon className="w-16 h-16 text-amber-500 mb-4" />}
                    <p className="text-gray-600">{message}</p>
                </div>
                <button onClick={onClose} className="w-full mt-4 px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44] text-sm font-medium">Got it</button>
            </div>
        </div>
    );
};

const RatingModal = ({ isOpen, onClose, doctorName, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) { setError('Please select a rating'); return; }
        setError('');
        setSubmitting(true);
        const success = await onSubmit(rating, review);
        setSubmitting(false);
        if (success) {
            setSubmitted(true);
            setTimeout(() => { setSubmitted(false); setRating(0); setReview(''); onClose(); }, 2000);
        } else {
            setError('Failed to submit review. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{submitted ? 'Thank You!' : `Rate ${doctorName}`}</h3>
                    {!submitted && <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>}
                </div>
                {submitted ? (
                    <div className="flex flex-col items-center py-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4"><Check className="w-8 h-8 text-emerald-500" /></div>
                        <p className="text-lg font-semibold text-gray-900">Review Submitted!</p>
                        <p className="text-sm text-gray-500 mt-1">Thank you for your feedback.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4">
                        <p className="text-gray-600 text-sm mb-4">How was your experience?</p>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="focus:outline-none transition-transform hover:scale-110">
                                    <Star className={`w-10 h-10 ${star <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} transition-colors`} />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && <p className="text-sm font-medium text-gray-700 mb-3">{['Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating - 1]}</p>}
                        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
                        <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Share your experience (optional)" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] text-sm resize-none h-24" />
                        <button onClick={handleSubmit} disabled={submitting || rating === 0} className="w-full mt-4 px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Rating'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────
export default function DoctorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMemberSelection, setShowMemberSelection] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [errorModalData, setErrorModalData] = useState({ title: '', message: '', icon: null });
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingMessage, setBookingMessage] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [familyId, setFamilyId] = useState(null);
    const [bookingStep, setBookingStep] = useState('select-member');
    const [isBooking, setIsBooking] = useState(false);
    const [appointmentType, setAppointmentType] = useState('in-person');

    const doctorId = params?.id;

    useEffect(() => { if (doctorId) fetchDoctorDetails(); }, [doctorId]);
    useEffect(() => { if (familyId) fetchFamilyMembers(); }, [familyId]);

    const fetchDoctorDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/patients/doctors/${doctorId}`);
            const result = await response.json();
            
            if (!response.ok) throw new Error(result.error || 'Failed to fetch doctor details');
            
            if (result.success) {
                setDoctor(result.data);
                const userResponse = await fetch('/api/auth/me');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (userData.user?.activeFamilyId) setFamilyId(userData.user.activeFamilyId);
                }
            } else throw new Error(result.message || 'Failed to load doctor');
        } catch (err) { 
            console.error('Error fetching doctor:', err); 
            setError(err.message); 
        }
        finally { setLoading(false); }
    };

    const fetchFamilyMembers = async () => {
        try {
            setLoadingMembers(true);
            const response = await fetch(`/api/family/members?familyId=${familyId}`);
            const result = await response.json();
            if (response.ok) {
                const members = result.members || [];
                setFamilyMembers(members);
                const primary = members.find(m => m.isPrimary);
                setSelectedMember(primary || members[0] || null);
            }
        } catch (error) { console.error('Error fetching family members:', error); }
        finally { setLoadingMembers(false); }
    };

    const handleBookAppointment = (slot, type = 'in-person') => {
        setSelectedSlot(slot);
        setAppointmentType(type);
        setBookingStep('select-member');
        setShowMemberSelection(true);
    };

    const handleProceedToBooking = () => {
        if (!selectedMember) {
            setErrorModalData({ title: 'No Member Selected', message: 'Please select a family member to book the appointment for.', icon: AlertCircle });
            setShowErrorModal(true);
            return;
        }
        setBookingStep('confirm-booking');
        setShowMemberSelection(false);
        setShowBookingModal(true);
        setBookingMessage('');
        setBookingSuccess(false);
    };

    const handleConfirmBooking = async () => {
        try {
            setIsBooking(true);
            setBookingMessage('Booking appointment...');

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const formattedDate = tomorrow.toISOString().split('T')[0];

            const response = await fetch('/api/patient/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: doctor._id,
                    patientMemberId: selectedMember._id,
                    condition: 'General Checkup',
                    appointmentDate: formattedDate,
                    timeSlot: selectedSlot,
                    type: appointmentType,
                    fee: appointmentType === 'video' ? doctor.videoConsultFee || doctor.consultationFee || 0 : doctor.consultationFee || 0,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessages = {
                    'MISSING_PHONE': { title: 'Phone Number Required', message: result.error || 'Please add a phone number to this family member.', icon: Phone },
                    'INVALID_PHONE': { title: 'Invalid Phone Number', message: result.error || 'Please update to a valid 10-digit number.', icon: Phone },
                    'PAST_SLOT': { title: 'Time Slot Passed', message: result.error || 'Please select a future time.', icon: Clock },
                };
                const err = errorMessages[result.code];
                if (err) {
                    setShowBookingModal(false);
                    setErrorModalData(err);
                    setShowErrorModal(true);
                    setIsBooking(false);
                    return;
                }
                setShowBookingModal(false);
                setErrorModalData({ title: 'Booking Failed', message: result.error || 'Failed to book appointment.', icon: AlertCircle });
                setShowErrorModal(true);
                setIsBooking(false);
                return;
            }

            if (result.success) {
                setBookingSuccess(true);
                setBookingMessage('Appointment booked successfully!');
                setTimeout(() => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                    setBookingSuccess(false);
                    setSelectedMember(null);
                    setBookingStep('select-member');
                    setIsBooking(false);
                    setShowRatingModal(true);
                }, 1500);
            }
        } catch (error) {
            console.error('Booking error:', error);
            setShowBookingModal(false);
            setErrorModalData({ title: 'Booking Failed', message: error.message || 'An unexpected error occurred.', icon: AlertCircle });
            setShowErrorModal(true);
            setIsBooking(false);
        }
    };

    const handleSubmitRating = async (rating, review) => {
        try {
            const memberId = selectedMember?._id || familyMembers[0]?._id;
            const response = await fetch('/api/patient/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: doctor._id, rating, text: review || '', memberId: memberId || null }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to submit review');
            if (result.success) { await fetchDoctorDetails(); return true; }
            throw new Error(result.error || 'Failed to submit review');
        } catch (error) {
            console.error('Error submitting rating:', error);
            setErrorModalData({ title: 'Failed to Submit Review', message: error.message || 'Please try again later.', icon: AlertCircle });
            setShowErrorModal(true);
            return false;
        }
    };

    const getWhatsAppLink = (phone) => `https://wa.me/91${phone?.replace(/[^0-9]/g, '') || ''}`;
    
    // ─── Handle plan properly ───
    const planType = typeof doctor?.plan === 'string' ? doctor?.plan : doctor?.plan?.type;
    const isPro = planType === 'pro' || planType === 'premium';
    const isPremium = planType === 'premium';
    const videoFee = doctor?.videoConsultFee || 0;
    const hasVideo = isPro && videoFee > 0;

    if (loading) return (
        <div className="min-h-screen bg-[#FAF8F5]">
            <Sidebar />
            <main className="md:pl-[280px]">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center"><Loader2 className="w-12 h-12 text-[#0D1B2A] animate-spin mx-auto mb-4" /><p className="text-gray-500">Loading doctor details...</p></div>
                </div>
            </main>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#FAF8F5]">
            <Sidebar />
            <main className="md:pl-[280px]">
                <div className="flex items-center justify-center h-screen p-4">
                    <div className="text-center max-w-md">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Doctor</h3>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <button onClick={fetchDoctorDetails} className="px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44]">Try Again</button>
                    </div>
                </div>
            </main>
        </div>
    );

    if (!doctor) return (
        <div className="min-h-screen bg-[#FAF8F5]">
            <Sidebar />
            <main className="md:pl-[280px]">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center"><Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Doctor not found</p>
                        <button onClick={() => router.back()} className="mt-4 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">Go Back</button>
                    </div>
                </div>
            </main>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAF8F5]">
            <Sidebar />
            <main className="md:pl-[280px]">
                <div className="max-w-4xl mx-auto px-4 md:px-10 py-6 pt-16 md:pt-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Search
                    </button>

                    <ErrorModal isOpen={showErrorModal} onClose={() => { setShowErrorModal(false); setErrorModalData({ title: '', message: '', icon: null }); }} title={errorModalData.title} message={errorModalData.message} icon={errorModalData.icon} />
                    <RatingModal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} doctorName={doctor.name} onSubmit={handleSubmitRating} />

                    {/* Member Selection Modal */}
                    {showMemberSelection && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Select Family Member</h3>
                                    <button onClick={() => setShowMemberSelection(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Who is this appointment for?</p>
                                {loadingMembers ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-[#0D1B2A] animate-spin" /></div>
                                ) : familyMembers.length === 0 ? (
                                    <div className="text-center py-8"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No family members found</p></div>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {familyMembers.map((member) => (
                                            <button key={member._id} onClick={() => setSelectedMember(member)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selectedMember?._id === member._id ? 'border-[#0D1B2A] bg-[#0D1B2A]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className={`w-10 h-10 rounded-full ${getColorClass(member.avatarColor || '#6B7280')} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{member.name?.charAt(0) || '?'}</div>
                                                <div className="flex-1 text-left"><p className="font-semibold text-gray-900">{member.name}</p><p className="text-xs text-gray-500 capitalize">{member.relationship || 'Member'}</p></div>
                                                {selectedMember?._id === member._id && <Check className="w-5 h-5 text-[#0D1B2A]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowMemberSelection(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
                                    <button onClick={handleProceedToBooking} disabled={!selectedMember} className="flex-1 px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44] text-sm font-medium disabled:opacity-50">Continue →</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking Modal */}
                    {showBookingModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Confirm Appointment</h3>
                                    <button onClick={() => setShowBookingModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full ${getColorClass(doctor.color)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{doctor.initials}</div>
                                        <div><p className="font-semibold text-gray-900">{doctor.name}</p><p className="text-sm text-gray-500">{doctor.specialty}</p></div>
                                    </div>
                                    {selectedMember && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Patient</p><p className="font-semibold text-gray-900">{selectedMember.name}</p></div>}
                                    <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Selected Slot</p><p className="font-semibold text-gray-900">{selectedSlot}</p></div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500">Appointment Type</p>
                                        <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                                            {appointmentType === 'video' ? <Video className="w-4 h-4 text-blue-600" /> : <Clock className="w-4 h-4 text-gray-600" />}
                                            {appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                                            <span className="text-sm font-normal text-gray-500">
                                                (₹{appointmentType === 'video' ? doctor.videoConsultFee || doctor.consultationFee || 0 : doctor.consultationFee || 0})
                                            </span>
                                        </p>
                                    </div>
                                    {bookingMessage && <div className={`p-3 rounded-lg text-sm ${bookingSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{bookingMessage}</div>}
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowBookingModal(false)} disabled={bookingSuccess} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50">Cancel</button>
                                        <button onClick={handleConfirmBooking} disabled={isBooking || bookingSuccess} className="flex-1 px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                            {isBooking ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : bookingSuccess ? '✓ Booked' : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctor Profile */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex items-start gap-4">
                                <div className={`w-20 h-20 rounded-2xl ${getColorClass(doctor.color || '#6B7280')} flex items-center justify-center text-white text-2xl font-bold shadow-sm shrink-0`}>{doctor.initials || 'D'}</div>
                                <div className="flex-1 md:hidden">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl font-bold text-gray-900">{doctor.name}</h1>
                                        {doctor.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />}
                                        {isPro && <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isPremium ? 'bg-amber-400 text-white' : 'bg-blue-500 text-white'}`}>{isPremium ? 'Premium' : 'Pro'}</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
                                    <p className="text-sm text-gray-400">{doctor.hospital}</p>
                                </div>
                            </div>
                            <div className="flex-1 hidden md:block">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                                            {doctor.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />}
                                            {isPro && <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isPremium ? 'bg-amber-400 text-white' : 'bg-blue-500 text-white'}`}>{isPremium ? 'Premium' : 'Pro'}</span>}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
                                        <p className="text-sm text-gray-400">{doctor.hospital}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">₹{doctor.consultationFee || 0}</p>
                                        <p className="text-xs text-gray-400">per visit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:hidden flex justify-end mt-2"><p className="text-xl font-bold text-gray-900">₹{doctor.consultationFee || 0}</p></div>

                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            <div className="flex items-center gap-2"><StarRating rating={doctor.stats?.avgRating || 0} /><span className="text-sm font-medium text-gray-700">{doctor.stats?.avgRating || 0}</span><span className="text-sm text-gray-400">({doctor.stats?.totalReviews || 0} reviews)</span></div>
                            <div className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-4 h-4" />{doctor.city || 'Location not specified'}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" />{doctor.experience || 0} years</div>
                        </div>

                        {doctor.conditions?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">{doctor.conditions.slice(0, 6).map((c) => <span key={c} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600">{c}</span>)}</div>
                        )}
                        {doctor.languages?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                <Languages className="w-4 h-4 text-gray-400" />
                                {doctor.languages.map((lang) => <span key={lang} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">{lang}</span>)}
                            </div>
                        )}
                    </div>

                    {doctor.about && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"><h2 className="text-lg font-bold text-gray-900 mb-3">About</h2><p className="text-sm text-gray-600 leading-relaxed">{doctor.about}</p></div>}

                    {(doctor.education?.length > 0 || doctor.awards?.length > 0) && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                            {doctor.education?.length > 0 && (
                                <><div className="flex items-center gap-2 mb-3"><GraduationCap className="w-5 h-5 text-gray-400" /><h2 className="text-lg font-bold text-gray-900">Education</h2></div>
                                    <ul className="space-y-2 mb-4">{doctor.education.map((edu, idx) => <li key={idx} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-emerald-500 mt-1">•</span>{edu}</li>)}</ul></>
                            )}
                            {doctor.awards?.length > 0 && (
                                <><div className="flex items-center gap-2 mb-3"><Award className="w-5 h-5 text-amber-400" /><h2 className="text-lg font-bold text-gray-900">Awards</h2></div>
                                    <ul className="space-y-2">{doctor.awards.map((award, idx) => <li key={idx} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-amber-400 mt-1">★</span>{award}</li>)}</ul></>
                            )}
                        </div>
                    )}

                    {/* ─── Appointment Slots with Type Selection ─── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Available Slots</h2>
                            {hasVideo && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Video className="w-3 h-3" /> Video Available
                                </span>
                            )}
                        </div>
                        {doctor.appointmentSlots?.length > 0 ? (
                            <div>
                                {/* ─── Type Selection Toggle ─── */}
                                {hasVideo && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-2">Select Appointment Type:</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setAppointmentType('in-person')}
                                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                                    appointmentType === 'in-person'
                                                        ? 'bg-[#0D1B2A] text-white shadow-md'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <Clock className="w-4 h-4" />
                                                In-Person
                                                <span className="text-xs font-normal opacity-80">₹{doctor.consultationFee || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => setAppointmentType('video')}
                                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                                    appointmentType === 'video'
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <Video className="w-4 h-4" />
                                                Video
                                                <span className="text-xs font-normal opacity-80">₹{doctor.videoConsultFee || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ─── Slots List ─── */}
                                <div className="space-y-2">
                                    {doctor.appointmentSlots.map((slot, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleBookAppointment(slot, appointmentType)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md ${
                                                appointmentType === 'video' && hasVideo
                                                    ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {appointmentType === 'video' && hasVideo ? (
                                                    <Video className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-gray-600" />
                                                )}
                                                <span className="font-semibold text-gray-900">{slot}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-600">
                                                    ₹{appointmentType === 'video' && hasVideo ? doctor.videoConsultFee || 0 : doctor.consultationFee || 0}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    appointmentType === 'video' && hasVideo
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {appointmentType === 'video' && hasVideo ? 'Video' : 'In-Person'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {!hasVideo && (
                                    <p className="text-xs text-gray-400 mt-3">Video consultations are not available for this doctor.</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No available slots at the moment.</p>
                        )}
                    </div>

                    {/* ─── Actions ─── */}
                    <div className="flex flex-wrap gap-4">
                        <a href={getWhatsAppLink(doctor.phone)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#20bd5a] transition-colors shadow-sm flex items-center justify-center gap-2">
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>
                        <a href={`tel:+91${doctor.phone?.replace(/[^0-9]/g, '') || ''}`} className="flex-1 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" /> Call Clinic
                        </a>
                        <button onClick={() => setShowRatingModal(true)} className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2">
                            <Star className="w-4 h-4 fill-current" /> Rate Doctor
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}