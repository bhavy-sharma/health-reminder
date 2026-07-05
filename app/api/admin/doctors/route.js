// app/api/admin/doctors/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Review from "@/models/Review";

export async function GET(request) {
  try {
    console.log('===== DOCTORS API CALLED =====');
    
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

    console.log('Doctors API: Access granted');

    // 2. Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const specialty = searchParams.get("specialty") || "All Specialties";
    const status = searchParams.get("status") || "All Status";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Build query
    const query = {};
    
    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { specialty: searchRegex },
        { city: searchRegex },
        { medicalRegNo: searchRegex },
      ];
    }

    // Specialty filter
    if (specialty !== "All Specialties") {
      query.specialty = specialty;
    }

    // Status filter
    if (status !== "All Status") {
      if (status === 'verified') {
        query.isVerified = true;
      } else if (status === 'pending') {
        query.isVerified = false;
      }
    }

    // Get total count
    const total = await Doctor.countDocuments(query);
    console.log(`Total doctors found: ${total}`);

    // Get doctors with pagination
    const doctors = await Doctor.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`Returning ${doctors.length} doctors for page ${page}`);

    // Get review counts and ratings for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.find({ 
          doctorId: doctor._id,
          isFlagged: false 
        });
        
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
          : 0;

        return {
          id: doctor._id,
          name: doctor.name,
          specialty: doctor.specialty || 'General',
          city: doctor.city || 'Unknown',
          medicalRegNo: doctor.medicalRegNo || 'Pending',
          rating: Math.round(avgRating * 10) / 10 || 0,
          reviews: totalReviews,
          joined: doctor.createdAt,
          status: doctor.isVerified ? 'verified' : 'pending',
          pending: !doctor.isVerified,
          isVerified: doctor.isVerified,
          email: doctor.email,
          phone: doctor.phone,
          hospital: doctor.hospital,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          videoConsultFee: doctor.videoConsultFee,
          about: doctor.about,
          languages: doctor.languages || [],
          conditions: doctor.conditions || [],
          education: doctor.education || [],
          awards: doctor.awards || [],
          appointmentSlots: doctor.appointmentSlots || [],
          plan: doctor.plan,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        doctors: doctorsWithStats,
        total,
        page,
        limit,
        totalPages,
        filters: {
          search,
          specialty,
          status,
        },
        stats: {
          verified: await Doctor.countDocuments({ isVerified: true }),
          pending: await Doctor.countDocuments({ isVerified: false }),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch doctors" 
      },
      { status: 500 }
    );
  }
}

// ── POST: Doctor actions ──────────────────────────────────────

export async function POST(request) {
  try {
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status || 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { action, doctorIds, reason } = body;

    if (!action || !doctorIds || doctorIds.length === 0) {
      return NextResponse.json(
        { error: "Action and doctorIds are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'verify':
        console.log('Verifying doctors:', doctorIds);
        result = await Doctor.updateMany(
          { _id: { $in: doctorIds } },
          { 
            isVerified: true,
          }
        );
        // Also update the associated user
        await User.updateMany(
          { role: 'doctor', 'doctorId': { $in: doctorIds } },
          { isVerified: true }
        );
        break;

      case 'reject':
        console.log('Rejecting doctors:', doctorIds);
        // Delete the doctor and associated user
        const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('_id email').lean();
        const doctorEmails = doctors.map(d => d.email);
        
        result = await Doctor.deleteMany({ _id: { $in: doctorIds } });
        await User.deleteMany({ email: { $in: doctorEmails } });
        break;

      case 'suspend':
        console.log('Suspending doctors:', doctorIds);
        result = await Doctor.updateMany(
          { _id: { $in: doctorIds } },
          { 
            isVerified: false,
            suspendedReason: reason || 'Suspended by admin',
            suspendedAt: new Date(),
          }
        );
        await User.updateMany(
          { role: 'doctor', 'doctorId': { $in: doctorIds } },
          { isSuspended: true, suspendedReason: reason || 'Suspended by admin' }
        );
        break;

      case 'unsuspend':
        console.log('Unsuspending doctors:', doctorIds);
        result = await Doctor.updateMany(
          { _id: { $in: doctorIds } },
          { 
            isVerified: true,
            suspendedReason: null,
            suspendedAt: null,
          }
        );
        await User.updateMany(
          { role: 'doctor', 'doctorId': { $in: doctorIds } },
          { isSuspended: false, suspendedReason: null }
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${action} action completed successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Error updating doctors:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to update doctors" 
      },
      { status: 500 }
    );
  }
}