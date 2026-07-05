// app/api/admin/analytics/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import Payment from "@/models/Payment";
import Review from "@/models/Review";

export async function GET(request) {
  try {
    console.log('Analytics API: Starting request...');
    
    // 1. Validate user role - ADMIN or STAFF only
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
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

    console.log('Analytics API: Access granted to:', authResult.user?.email, 'Role:', authResult.user?.role);

    // 2. Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
    const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;

    // Get all analytics data in parallel
    const [
      statCards,
      userGrowth,
      revenue,
      planDistribution,
      appointmentsByDay,
      topSpecialties,
    ] = await Promise.all([
      getStatCards(month, year),
      getUserGrowth(period),
      getRevenueData(period),
      getPlanDistribution(),
      getAppointmentsByDay(),
      getTopSpecialties(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        statCards,
        userGrowth,
        revenue,
        planDistribution,
        appointmentsByDay,
        topSpecialties,
      },
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch analytics" 
      },
      { status: 500 }
    );
  }
}

// ── Helper Functions ─────────────────────────────────────────

async function getStatCards(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Current month stats - Fetch from User model for patients
  const [
    totalPatients,
    activeDoctors,
    monthlyRevenue,
    appointmentsToday,
    previousMonthPatients,
    previousMonthDoctors,
    previousMonthRevenue,
    previousMonthAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: 'patient' }), // Total patients from User model
    Doctor.countDocuments({ isVerified: true }),
    getMonthlyRevenue(startDate, endDate),
    getTodayAppointments(),
    User.countDocuments({
      role: 'patient',
      createdAt: { $lt: startDate }
    }),
    Doctor.countDocuments({ 
      isVerified: true,
      createdAt: { $lt: startDate }
    }),
    getMonthlyRevenue(
      new Date(year, month - 2, 1),
      new Date(year, month - 1, 0)
    ),
    getAppointmentsForDate(new Date(new Date().setDate(new Date().getDate() - 1))),
  ]);

  // Calculate growth percentages
  const patientGrowth = previousMonthPatients > 0
    ? Math.round(((totalPatients - previousMonthPatients) / previousMonthPatients) * 100)
    : 0;

  const doctorGrowth = previousMonthDoctors > 0
    ? Math.round(((activeDoctors - previousMonthDoctors) / previousMonthDoctors) * 100)
    : 0;

  const revenueGrowth = previousMonthRevenue > 0
    ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
    : 0;

  const appointmentGrowth = previousMonthAppointments > 0
    ? Math.round(((appointmentsToday - previousMonthAppointments) / previousMonthAppointments) * 100)
    : 0;

  return [
    {
      icon: "UserCircle2",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      value: formatNumber(totalPatients),
      label: "Total Patients",
      growth: `${patientGrowth > 0 ? "+" : ""}${patientGrowth}%`,
      up: patientGrowth >= 0,
    },
    {
      icon: "Activity",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      value: formatNumber(activeDoctors),
      label: "Active Doctors",
      growth: `${doctorGrowth > 0 ? "+" : ""}${doctorGrowth}%`,
      up: doctorGrowth >= 0,
    },
    {
      icon: "IndianRupee",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      value: `₹${formatCurrency(monthlyRevenue)}`,
      label: "Monthly Revenue",
      growth: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth}%`,
      up: revenueGrowth >= 0,
    },
    {
      icon: "CalendarCheck",
      iconBg: "bg-red-50",
      iconColor: "text-red-400",
      value: formatNumber(appointmentsToday),
      label: "Appointments Today",
      growth: `${appointmentGrowth > 0 ? "+" : ""}${appointmentGrowth}%`,
      up: appointmentGrowth >= 0,
    },
  ];
}

async function getUserGrowth(period = "month") {
  const months = period === "year" ? 12 : 6;
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Fetch from User model for patients
    const [patients, doctors] = await Promise.all([
      User.countDocuments({
        role: 'patient',
        createdAt: { $lte: endDate }
      }),
      Doctor.countDocuments({
        isVerified: true,
        createdAt: { $lte: endDate }
      }),
    ]);

    data.push({
      month: monthName,
      patients,
      doctors,
    });
  }

  return data;
}

async function getRevenueData(period = "month") {
  const months = period === "year" ? 12 : 6;
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    data.push({
      month: monthName,
      value: revenue.length > 0 ? revenue[0].total : 0,
    });
  }

  return data;
}

async function getPlanDistribution() {
  const plans = await Doctor.aggregate([
    {
      $group: {
        _id: "$plan.type",
        count: { $sum: 1 },
      },
    },
  ]);

  const planColors = {
    free: "#d1d5db",
    pro: "#10b981",
    premium: "#f59e0b",
  };

  const planLabels = {
    free: "Free",
    pro: "Pro",
    premium: "Premium",
  };

  // If no plans found, return default data
  if (plans.length === 0) {
    return [
      { name: "Free", value: 0, color: "#d1d5db" },
      { name: "Pro", value: 0, color: "#10b981" },
      { name: "Premium", value: 0, color: "#f59e0b" },
    ];
  }

  return plans.map((p) => ({
    name: planLabels[p._id] || p._id || "Unknown",
    value: p.count || 0,
    color: planColors[p._id] || "#d1d5db",
  }));
}

async function getAppointmentsByDay() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = [];

  // Get current week's appointments
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dayName = days[i];

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const count = await Appointment.countDocuments({
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: { $ne: "cancelled" },
    });

    data.push({
      day: dayName,
      value: count,
    });
  }

  return data;
}

async function getTopSpecialties(limit = 6) {
  const specialties = await Doctor.aggregate([
    {
      $match: {
        specialty: { $ne: null, $ne: "" },
        isVerified: true,
      },
    },
    {
      $group: {
        _id: "$specialty",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
  ]);

  if (specialties.length === 0) {
    return [
      { rank: 1, name: "No specialties available", count: 0 }
    ];
  }

  return specialties.map((s, index) => ({
    rank: index + 1,
    name: s._id,
    count: s.count,
  }));
}

// ── Utility Functions ──────────────────────────────────────

async function getMonthlyRevenue(startDate, endDate) {
  const result = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        completedAt: { $gte: startDate, $lte: endDate },
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

async function getTodayAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Appointment.countDocuments({
    appointmentDate: { $gte: today, $lt: tomorrow },
    status: { $ne: "cancelled" },
  });
}

async function getAppointmentsForDate(date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return Appointment.countDocuments({
    appointmentDate: { $gte: startDate, $lte: endDate },
    status: { $ne: "cancelled" },
  });
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function formatCurrency(num) {
  if (num >= 100000) {
    return (num / 100000).toFixed(1) + 'L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}