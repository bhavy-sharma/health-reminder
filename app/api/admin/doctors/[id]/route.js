// app/api/admin/doctors/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Review from "@/models/Review";
import Appointment from "@/models/Appointment";

export async function GET(request, { params }) {
  try {
    console.log('===== DOCTOR DETAIL API =====');
    
    const { id } = params;
    console.log('Doctor ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

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

    await connectToDatabase();

    // Get doctor
    const doctor = await Doctor.findById(id).lean();
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Get associated user
    const user = await User.findOne({ 
      role: 'doctor',
      email: doctor.email 
    }).select('-password -otp -resetToken').lean();

    // Get reviews
    const reviews = await Review.find({ 
      doctorId: doctor._id,
      isFlagged: false 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Get appointment stats
    const totalAppointments = await Appointment.countDocuments({ 
      doctorId: doctor._id 
    });
    
    const upcomingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Calculate average rating
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const doctorData = {
      ...doctor,
      user,
      reviews,
      stats: {
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalAppointments,
        upcomingAppointments,
        reviewCount: totalReviews,
      }
    };

    return NextResponse.json({
      success: true,
      data: doctorData,
    });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch doctor details" 
      },
      { status: 500 }
    );
  }
}

// ── PUT: Update doctor ──────────────────────────────────────

export async function PUT(request, { params }) {
  try {
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status || 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    const body = await request.json();
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Update doctor fields
    const updateFields = {
      name: body.name,
      specialty: body.specialty,
      city: body.city,
      hospital: body.hospital,
      medicalRegNo: body.medicalRegNo,
      experience: body.experience,
      consultationFee: body.consultationFee,
      videoConsultFee: body.videoConsultFee,
      about: body.about,
      languages: body.languages,
      conditions: body.conditions,
      education: body.education,
      awards: body.awards,
      appointmentSlots: body.appointmentSlots,
      tagline: body.tagline,
      address: body.address,
      coordinates: body.coordinates,
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => 
      updateFields[key] === undefined && delete updateFields[key]
    );

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to update doctor" 
      },
      { status: 500 }
    );
  }
}