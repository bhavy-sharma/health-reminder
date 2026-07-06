// app/api/doctor/profile/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Doctor from "@/models/Doctor";

export async function GET(request) {
  try {
    console.log('===== DOCTOR PROFILE API =====');
    
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

    // Format the profile data
    const profileData = {
      fullName: doctor.name || '',
      specialty: doctor.specialty || '',
      tagline: doctor.tagline || '',
      experience: doctor.experience || 0,
      regNo: doctor.medicalRegNo || '',
      inPersonFee: doctor.consultationFee || 0,
      videoFee: doctor.videoConsultFee || 0,
      bio: doctor.about || '',
      hospital: doctor.hospital || '',
      address: doctor.address || '',
      city: doctor.city || '',
      languages: doctor.languages || [],
      conditions: doctor.conditions || [],
      education: doctor.education || [],
      awards: doctor.awards || [],
      slots: doctor.appointmentSlots || [],
      avatarColor: doctor.avatarColor || '#6B7280',
      isVerified: doctor.isVerified || false,
      status: doctor.status || 'pending',
      rating: doctor.rating || 0,
      reviewCount: doctor.reviewCount || 0,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });

  } catch (error) {
    console.error("Doctor profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}


// app/api/doctor/profile/route.js (continued)

export async function PUT(request) {
  try {
    console.log('===== DOCTOR PROFILE UPDATE API =====');
    
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
    console.log('Updating profile with:', body);

    // Find doctor
    let doctor = await Doctor.findOne({ email: auth.email });
    if (!doctor) {
      doctor = await Doctor.findById(auth.userId);
    }

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Update fields
    const updateFields = {
      name: body.fullName,
      specialty: body.specialty,
      tagline: body.tagline,
      experience: body.experience,
      medicalRegNo: body.regNo,
      consultationFee: body.inPersonFee,
      videoConsultFee: body.videoFee,
      about: body.bio,
      hospital: body.hospital,
      address: body.address,
      city: body.city,
      languages: body.languages || [],
      conditions: body.conditions || [],
      education: body.education || [],
      awards: body.awards || [],
      appointmentSlots: body.slots || [],
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => 
      updateFields[key] === undefined && delete updateFields[key]
    );

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        fullName: updatedDoctor.name,
        specialty: updatedDoctor.specialty,
        tagline: updatedDoctor.tagline,
        experience: updatedDoctor.experience,
        regNo: updatedDoctor.medicalRegNo,
        inPersonFee: updatedDoctor.consultationFee,
        videoFee: updatedDoctor.videoConsultFee,
        bio: updatedDoctor.about,
        hospital: updatedDoctor.hospital,
        address: updatedDoctor.address,
        city: updatedDoctor.city,
        languages: updatedDoctor.languages,
        conditions: updatedDoctor.conditions,
        education: updatedDoctor.education,
        awards: updatedDoctor.awards,
        slots: updatedDoctor.appointmentSlots,
        avatarColor: updatedDoctor.avatarColor,
        isVerified: updatedDoctor.isVerified,
        status: updatedDoctor.status,
      },
    });

  } catch (error) {
    console.error("Doctor profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}