// app/api/doctor/dashboard/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import Review from "@/models/Review";
import User from "@/models/User";

export async function GET(request) {
  try {
    console.log('===== DOCTOR DASHBOARD API =====');
    
    // Use the auth helper
    const auth = await getAuthenticatedUser(request);
    console.log('Auth result:', { 
      authenticated: auth?.authenticated, 
      role: auth?.role,
      userId: auth?.userId,
      email: auth?.email
    });

    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    if (auth.isSuspended) {
      return NextResponse.json(
        { error: "Account suspended", reason: auth.suspendedReason },
        { status: 403 }
      );
    }

    if (auth.role !== 'doctor') {
      return NextResponse.json(
        { error: "Access denied. Doctor access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find doctor by email or ID
    let doctor = await Doctor.findOne({ email: auth.email })
      .select('-password')
      .lean();

    if (!doctor) {
      doctor = await Doctor.findById(auth.userId)
        .select('-password')
        .lean();
    }

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Check if doctor is approved
    if (doctor.status !== 'approved') {
      return NextResponse.json(
        { error: `Account is ${doctor.status}. Please contact support.` },
        { status: 403 }
      );
    }

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    })
    .populate('patientMemberId', 'name')
    .sort({ timeSlot: 1 })
    .lean();

    // Get upcoming appointments count
    const upcomingCount = await Appointment.countDocuments({
      doctorId: doctor._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Get reviews and rating
    const reviews = await Review.find({
      doctorId: doctor._id,
      isFlagged: false
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    const totalReviews = await Review.countDocuments({
      doctorId: doctor._id,
      isFlagged: false
    });

    const avgRatingResult = await Review.aggregate([
      { $match: { doctorId: doctor._id, isFlagged: false } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);

    const avgRating = avgRatingResult.length > 0 ? Math.round(avgRatingResult[0].avg * 10) / 10 : 0;

    // Get monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctor._id,
          status: 'completed',
          appointmentDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$fee" }
        }
      }
    ]);

    const totalConsultations = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'completed'
    });

    // Format today's appointments
    const formattedAppointments = todayAppointments.map(app => ({
      id: app._id,
      patientName: app.patientName || 'Unknown Patient',
      patientInitials: getInitials(app.patientName || 'Unknown'),
      patientColor: getAvatarColor(app.patientName || 'Unknown'),
      age: app.patientAge || 'N/A',
      condition: app.condition || 'General Checkup',
      time: app.timeSlot,
      status: app.status,
      isConfirmed: app.status === 'confirmed'
    }));

    // Format recent activity
    const recentActivity = [];

    // Add recent bookings
    const recentAppointments = await Appointment.find({
      doctorId: doctor._id,
      status: { $in: ['pending', 'confirmed'] }
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    for (const app of recentAppointments) {
      recentActivity.push({
        type: 'booking',
        message: `${app.patientName || 'A patient'} booked ${new Date(app.appointmentDate).toLocaleDateString()}, ${app.timeSlot}`,
        time: getTimeAgo(app.createdAt),
        icon: 'booking',
        color: '#10b981'
      });
    }

    // Add recent reviews
    for (const review of reviews.slice(0, 2)) {
      const patient = await User.findById(review.memberId).lean();
      recentActivity.push({
        type: 'review',
        message: `${patient?.fullName || 'A patient'} left a ${review.rating}-star review`,
        time: getTimeAgo(review.createdAt),
        icon: 'review',
        color: '#f59e0b'
      });
    }

    // Add cancellations
    const cancellations = await Appointment.find({
      doctorId: doctor._id,
      status: 'cancelled'
    })
    .sort({ createdAt: -1 })
    .limit(2)
    .lean();

    for (const app of cancellations) {
      recentActivity.push({
        type: 'cancellation',
        message: `${app.patientName || 'A patient'} cancelled ${new Date(app.appointmentDate).toLocaleDateString()}, ${app.timeSlot}`,
        time: getTimeAgo(app.createdAt),
        icon: 'cancellation',
        color: '#ef4444'
      });
    }

    // Sort recent activity by time
    recentActivity.sort((a, b) => {
      const timeA = parseInt(a.time);
      const timeB = parseInt(b.time);
      return timeA - timeB;
    });

    // Format recent reviews for display
    const formattedReviews = reviews.map(review => ({
      id: review._id,
      patientName: review.authorName || 'Anonymous',
      patientInitials: getInitials(review.authorName || 'Anonymous'),
      patientColor: getAvatarColor(review.authorName || 'Anonymous'),
      rating: review.rating,
      text: review.text,
      time: getTimeAgo(review.createdAt)
    }));

    // Ensure all fields are properly initialized with defaults
    return NextResponse.json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialty: doctor.specialty,
          city: doctor.city,
          isVerified: doctor.isVerified,
          status: doctor.status,
          plan: doctor.plan?.type || 'free',
          rating: avgRating,
          reviewCount: totalReviews,
          profileViews: doctor.profileViews || 0
        },
        stats: {
          todayPatients: todayAppointments.length,
          confirmedToday: todayAppointments.filter(a => a.status === 'confirmed').length,
          pendingToday: todayAppointments.filter(a => a.status === 'pending').length,
          avgRating: avgRating,
          totalReviews: totalReviews,
          profileViews: doctor.profileViews || 0,
          monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
          totalConsultations: totalConsultations,
          upcomingAppointments: upcomingCount
        },
        appointments: formattedAppointments || [],
        recentActivity: recentActivity || [],
        recentReviews: formattedReviews || []
      }
    });

  } catch (error) {
    console.error('Doctor dashboard error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
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

function getTimeAgo(date) {
  if (!date) return 'Just now';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) === 1 ? '' : 's'} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
  return new Date(date).toLocaleDateString();
}