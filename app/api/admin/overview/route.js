// app/api/admin/overview/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import Review from "@/models/Review";
import Appointment from "@/models/Appointment";
import Payment from "@/models/Payment";
import Settings from "@/models/Settings";
import { getAverageRating, getResponseRate, getAppointmentsToday } from "@/lib/healthStats";

export async function GET(request) {
  try {
    console.log('Overview API: Starting request...');
    
    // 1. Validate user role - ADMIN only
    const authResult = await validateUserRole(request, 'admin');
    
    if (!authResult.valid) {
      return NextResponse.json(
        { 
          error: authResult.error || 'Authentication failed',
          message: authResult.reason || authResult.error,
          status: authResult.status 
        },
        { status: authResult.status || 401 }
      );
    }

    console.log('Overview API: Access granted to:', authResult.user?.email);

    // 2. Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    // Get all stats in parallel for better performance
    const [
      stats,
      alerts,
      monthlyRevenueData,
      healthStats,
      newPatients,
      pendingDoctors,
    ] = await Promise.all([
      getStats(),
      getAlerts(),
      getMonthlyRevenueData(period), // New function for monthly revenue
      getHealthStats(),
      getNewPatients(),
      getPendingDoctors(),
      Settings.findOne()
    ]);

    // Ensure settings exists
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ homepage: { showPlatformHealth: false } });
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        alerts,
        monthlyRevenue: monthlyRevenueData, // Changed from 'revenue' to 'monthlyRevenue'
        healthStats,
        newPatients,
        pendingDoctors,
        settings: settings.homepage,
      },
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch admin overview" },
      { status: 500 }
    );
  }
}

// ─── NEW: Get Monthly Revenue Data ───
async function getMonthlyRevenueData(period = "month") {
  try {
    const months = period === "year" ? 12 : 6;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      let monthlyRevenue = 0;
      
      try {
        // Try to get from Payment model first
        const paymentResult = await Payment.aggregate([
          {
            $match: {
              status: 'success',
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" }
            }
          }
        ]);
        
        if (paymentResult.length > 0) {
          monthlyRevenue = paymentResult[0].total;
        }
      } catch (error) {
        console.log('Payment model not found, trying Subscription...');
        
        try {
          // Fallback: try Subscription model
          const subResult = await Subscription.aggregate([
            {
              $match: {
                status: 'active',
                startDate: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ]);
          
          if (subResult.length > 0) {
            monthlyRevenue = subResult[0].total;
          }
        } catch (subError) {
          // Final fallback: estimate from doctor plan data
          const doctorCount = await Doctor.countDocuments({
            'plan.type': { $ne: 'free' },
            'plan.updatedAt': { $gte: startDate, $lte: endDate }
          });
          monthlyRevenue = doctorCount * 500; // Estimate
        }
      }

      data.push({
        month: monthName,
        value: monthlyRevenue,
      });
    }

    return data;
  } catch (error) {
    console.error("Error getting monthly revenue data:", error);
    const months = period === "year" ? 12 : 6;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        month: date.toLocaleString('default', { month: 'short' }),
        value: 0,
      });
    }
    return data;
  }
}

// ─── Helper Functions ─────────────────────────────────────────

async function getStats() {
  const [
    totalPatients,
    activeFamilies,
    verifiedDoctors,
    pendingDoctorsCount,
    monthlyRevenue,
    paidDoctors,
  ] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    Family.countDocuments({ isActive: true }),
    Doctor.countDocuments({ isVerified: true }),
    Doctor.countDocuments({ isVerified: false }),
    getMonthlyRevenue(),
    Doctor.countDocuments({ 
      "plan.type": { $in: ["pro", "premium"] },
      "plan.expiresAt": { $gt: new Date() }
    }),
  ]);

  const previousMonthPatients = await User.countDocuments({
    role: 'patient',
    createdAt: { $lt: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
  });
  const patientGrowth = previousMonthPatients > 0 
    ? Math.round(((totalPatients - previousMonthPatients) / previousMonthPatients) * 100)
    : 0;

  const previousMonthDoctors = await Doctor.countDocuments({
    createdAt: { $lt: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
  });
  const doctorGrowth = previousMonthDoctors > 0
    ? Math.round(((verifiedDoctors - previousMonthDoctors) / previousMonthDoctors) * 100)
    : 0;

  const previousMonthRevenue = await getMonthlyRevenue(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const revenueGrowth = previousMonthRevenue > 0
    ? Math.round(((monthlyRevenue - previousMonthRevenue) / monthlyRevenue) * 100)
    : 0;

  const previousMonthPaid = await Doctor.countDocuments({
    "plan.type": { $in: ["pro", "premium"] },
    "plan.expiresAt": { $gt: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
  });
  const paidGrowth = previousMonthPaid > 0
    ? Math.round(((paidDoctors - previousMonthPaid) / previousMonthPaid) * 100)
    : 0;

  return [
    {
      icon: "UserCircle2",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      value: formatNumber(totalPatients),
      label: "Total Patients",
      sub: `${activeFamilies} active families`,
      growth: `${patientGrowth > 0 ? "+" : ""}${patientGrowth}%`,
    },
    {
      icon: "Activity",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      value: formatNumber(verifiedDoctors),
      label: "Verified Doctors",
      sub: `${pendingDoctorsCount} pending`,
      growth: `${doctorGrowth > 0 ? "+" : ""}${doctorGrowth}%`,
    },
    {
      icon: "IndianRupee",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      // ─── FIX: Return raw number ───
      value: monthlyRevenue,
      label: "Monthly Revenue",
      sub: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
      growth: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth}%`,
    },
    {
      icon: "CreditCard",
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      value: formatNumber(paidDoctors),
      label: "Paid Doctors",
      sub: "Pro + Premium",
      growth: `${paidGrowth > 0 ? "+" : ""}${paidGrowth}%`,
    },
  ];
}

async function getAlerts() {
  const [flaggedReviews, pendingDoctors, failedPayments] = await Promise.all([
    Review.countDocuments({ isFlagged: true }),
    Doctor.countDocuments({ isVerified: false }),
    Payment.countDocuments({ 
      status: "failed",
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
  ]);

  const alerts = [];
  if (flaggedReviews > 0) {
    alerts.push({
      icon: "Flag",
      text: `${flaggedReviews} ${flaggedReviews === 1 ? 'review' : 'reviews'} flagged for moderation`,
      color: "text-red-600",
      bg: "bg-red-50 border-red-100",
    });
  }
  if (pendingDoctors > 0) {
    alerts.push({
      icon: "Clock",
      text: `${pendingDoctors} ${pendingDoctors === 1 ? 'doctor' : 'doctors'} awaiting verification`,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    });
  }
  if (failedPayments > 0) {
    alerts.push({
      icon: "AlertCircle",
      text: `${failedPayments} failed Razorpay ${failedPayments === 1 ? 'payment' : 'payments'} need attention`,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-100",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      icon: "ShieldCheck",
      text: "All systems operational. No pending issues.",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    });
  }

  return alerts;
}

async function getHealthStats() {
  const [
    avgRating,
    responseRate,
    appointmentsToday,
  ] = await Promise.all([
    getAverageRating(),
    getResponseRate(),
    getAppointmentsToday(),
  ]);

  return [
    { label: "Avg Doctor Rating", value: `${avgRating.toFixed(1)} ★`, valueColor: "text-amber-500" },
    { label: "Review Response Rate", value: `${responseRate}%`, valueColor: "text-gray-900" },
    { label: "Appointments Today", value: formatNumber(appointmentsToday), valueColor: "text-gray-900" },
  ];
}

async function getNewPatients(limit = 4) {
  const users = await User.find({ 
    role: 'patient',
    isVerified: true,
    isSuspended: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('fullName email mobile city createdAt families isVerified isSuspended')
    .lean();

  const patients = await Promise.all(
    users.map(async (user) => {
      let plan = 'Free';
      
      if (user.families && user.families.length > 0) {
        const activeFamily = user.families.find(f => f.isActive) || user.families[0];
        if (activeFamily) {
          const family = await Family.findById(activeFamily.familyId).lean();
          if (family) {
            plan = family.plan?.type || 'Free';
          }
        }
      }

      return {
        initials: getInitials(user.fullName),
        color: getRandomColor(),
        name: user.fullName || 'Unknown',
        location: user.city || 'Unknown',
        time: getTimeAgo(user.createdAt),
        plan: plan === 'Free' ? 'Free' : 'Family',
        planColor: plan === 'Free' 
          ? 'bg-gray-100 text-gray-500' 
          : 'bg-gray-100 text-gray-600',
        email: user.email,
        mobile: user.mobile,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
      };
    })
  );

  return patients;
}

async function getPendingDoctors(limit = 3) {
  const doctors = await Doctor.find({ isVerified: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return doctors.map((doctor) => ({
    initials: doctor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    color: getRandomColor(),
    name: doctor.name,
    spec: `${doctor.specialty || "General"} · ${doctor.city || "Unknown"}`,
    mci: doctor.medicalRegNo || "Pending",
  }));
}

// ─── Utility Functions ─────────────────────────────────────────

async function getMonthlyRevenue(date = new Date()) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  const result = await Payment.aggregate([
    {
      $match: {
        status: "success",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result.length > 0 ? result[0].total : 0;
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  
  if (diff < 3600) {
    return `${Math.floor(diff / 60)} ${Math.floor(diff / 60) === 1 ? 'min' : 'mins'} ago`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)} ${Math.floor(diff / 3600) === 1 ? 'hr' : 'hrs'} ago`;
  } else {
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
  }
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRandomColor() {
  const colors = [
    'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-rose-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-violet-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}