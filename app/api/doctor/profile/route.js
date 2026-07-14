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
        { error: auth?.error || "Please login to continue" },
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
      if (auth.hasDoctorProfile && auth.doctorStatus === 'pending') {
        return NextResponse.json(
          { error: "Your profile is under verification. Once it is verified, you will be able to access the dashboard." },
          { status: 403 }
        );
      }
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

    // Format the profile data with full address
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
      address: {
        street: doctor.address?.street || '',
        area: doctor.address?.area || '',
        landmark: doctor.address?.landmark || '',
        city: doctor.address?.city || doctor.city || '',
        district: doctor.address?.district || '',
        state: doctor.address?.state || '',
        pincode: doctor.address?.pincode || '',
        country: doctor.address?.country || 'India',
      },
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

    // Update fields with full address support
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
      // Address with all fields
      address: {
        street: body.address?.street || '',
        area: body.address?.area || '',
        landmark: body.address?.landmark || '',
        city: body.address?.city || body.city || '',
        district: body.address?.district || '',
        state: body.address?.state || '',
        pincode: body.address?.pincode || '',
        country: body.address?.country || 'India',
      },
      // Keep old city field for backward compatibility
      city: body.address?.city || body.city || '',
      languages: body.languages || [],
      conditions: body.conditions || [],
      education: body.education || [],
      awards: body.awards || [],
      appointmentSlots: body.slots || [],
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!updatedDoctor) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Return formatted response with full address
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
        address: {
          street: updatedDoctor.address?.street || '',
          area: updatedDoctor.address?.area || '',
          landmark: updatedDoctor.address?.landmark || '',
          city: updatedDoctor.address?.city || updatedDoctor.city || '',
          district: updatedDoctor.address?.district || '',
          state: updatedDoctor.address?.state || '',
          pincode: updatedDoctor.address?.pincode || '',
          country: updatedDoctor.address?.country || 'India',
        },
        city: updatedDoctor.city || '',
        languages: updatedDoctor.languages || [],
        conditions: updatedDoctor.conditions || [],
        education: updatedDoctor.education || [],
        awards: updatedDoctor.awards || [],
        slots: updatedDoctor.appointmentSlots || [],
        avatarColor: updatedDoctor.avatarColor,
        isVerified: updatedDoctor.isVerified,
        status: updatedDoctor.status,
        rating: updatedDoctor.rating,
        reviewCount: updatedDoctor.reviewCount,
      },
    });

  } catch (error) {
    console.error("Doctor profile update error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists. Please use a different ${field}.` },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return NextResponse.json(
        { error: errors[0] },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}