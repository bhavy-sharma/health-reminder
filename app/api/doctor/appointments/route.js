// app/api/doctor/appointments/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";

export async function GET(request) {
  try {
    console.log('===== DOCTOR APPOINTMENTS API =====');
    
    // Get authenticated user
    const auth = await getAuthenticatedUser(request);
    
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

    // Find doctor
    let doctor = await Doctor.findOne({ email: auth.email }).lean();
    if (!doctor) {
      doctor = await Doctor.findById(auth.userId).lean();
    }

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";

    // Build query
    const query = { doctorId: doctor._id };
    
    if (status !== "all") {
      query.status = status;
    }
    
    if (type !== "all") {
      query.type = type;
    }

    // Get appointments
    let appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, timeSlot: 1 })
      .populate('patientMemberId', 'name avatarColor')
      .lean();

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      appointments = appointments.filter(apt => 
        apt.patientName?.toLowerCase().includes(searchLower) ||
        apt.condition?.toLowerCase().includes(searchLower)
      );
    }

    // Format appointments
    const formattedAppointments = appointments.map(apt => ({
      id: apt._id,
      patient: apt.patientName || 'Unknown Patient',
      initials: getInitials(apt.patientName || 'Unknown'),
      color: apt.patientMemberId?.avatarColor || getAvatarColor(apt.patientName || 'Unknown'),
      age: apt.patientAge || 'N/A',
      condition: apt.condition || 'General Checkup',
      date: new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: apt.timeSlot,
      type: apt.type || 'in-person',
      status: apt.status || 'pending',
      phone: apt.patientPhone || '',
      notes: apt.doctorNote || '',
      fee: apt.fee || 0,
      createdAt: apt.createdAt,
    }));

    // Get counts for tabs
    const counts = {
      all: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      pending: appointments.filter(a => a.status === 'pending').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        counts,
      },
    });

  } catch (error) {
    console.error("Doctor appointments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// ── PUT: Update Appointment Status ────────────────────────────

export async function PUT(request) {
  try {
    console.log('===== DOCTOR APPOINTMENTS UPDATE API =====');
    
    // Get authenticated user
    const auth = await getAuthenticatedUser(request);
    
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

    const body = await request.json();
    const { appointmentId, status, note } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Valid statuses
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify doctor owns this appointment
    const doctor = await Doctor.findOne({ email: auth.email }).lean();
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this appointment" },
        { status: 403 }
      );
    }

    // Update the appointment
    appointment.status = status;
    if (note !== undefined) {
      appointment.doctorNote = note;
    }
    
    await appointment.save();

    return NextResponse.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: {
        id: appointment._id,
        status: appointment.status,
        doctorNote: appointment.doctorNote,
      },
    });

  } catch (error) {
    console.error("Doctor appointments update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// ── POST handler removed ──────────────────────────────────────

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