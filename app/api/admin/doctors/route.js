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

    console.log('Query params:', { search, specialty, status, page, limit });

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

    // Status filter - FIXED to handle all status types
    if (status !== "All Status") {
      if (status === 'approved') {
        query.isVerified = true;
        query.isSuspended = false;
        query.status = { $ne: 'rejected' };
      } else if (status === 'pending') {
        query.isVerified = false;
        query.isSuspended = false;
        query.status = { $ne: 'rejected' };
      } else if (status === 'rejected') {
        query.status = 'rejected';
      } else if (status === 'suspended') {
        query.isSuspended = true;
      } else if (status === 'verified') {
        // Keep for backward compatibility
        query.isVerified = true;
        query.isSuspended = false;
      }
    }

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

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

        // Determine correct status
        let doctorStatus = 'pending';
        if (doctor.isSuspended) {
          doctorStatus = 'suspended';
        } else if (doctor.status === 'rejected') {
          doctorStatus = 'rejected';
        } else if (doctor.isVerified) {
          doctorStatus = 'approved';
        }

        return {
          id: doctor._id,
          name: doctor.name,
          specialty: doctor.specialty || 'General',
          city: doctor.city || 'Unknown',
          medicalRegNo: doctor.medicalRegNo || 'Pending',
          rating: Math.round(avgRating * 10) / 10 || 0,
          reviews: totalReviews,
          joined: doctor.createdAt,
          status: doctorStatus,
          pending: doctorStatus === 'pending',
          isVerified: doctor.isVerified,
          isSuspended: doctor.isSuspended || false,
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
          medicalCertificate: doctor.medicalCertificate ? {
            url: doctor.medicalCertificate.url,
            fileName: doctor.medicalCertificate.fileName,
            fileType: doctor.medicalCertificate.fileType,
            uploadedAt: doctor.medicalCertificate.uploadedAt,
          } : null,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    // Get accurate stats
    const approved = await Doctor.countDocuments({ 
      isVerified: true, 
      isSuspended: false,
      status: { $ne: 'rejected' }
    });
    const pending = await Doctor.countDocuments({ 
      isVerified: false, 
      isSuspended: false,
      status: { $ne: 'rejected' }
    });
    const rejected = await Doctor.countDocuments({ status: 'rejected' });
    const suspended = await Doctor.countDocuments({ isSuspended: true });

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
          approved,
          pending,
          rejected,
          suspended,
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
    const { action, doctorIds, reason, note } = body;

    if (!action || !doctorIds || doctorIds.length === 0) {
      return NextResponse.json(
        { error: "Action and doctorIds are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'approve':
      case 'verify':
        console.log('Approving/Verifying doctors:', doctorIds);
        result = await Doctor.updateMany(
          { _id: { $in: doctorIds } },
          { 
            isVerified: true,
            isSuspended: false,
            status: 'approved',
            suspendedReason: null,
            suspendedAt: null,
          }
        );
        await User.updateMany(
          { 'doctorId': { $in: doctorIds } },
          { 
            isVerified: true,
            isSuspended: false,
            suspendedReason: null,
            role: 'doctor'
          }
        );
        break;

      case 'reject':
        console.log('Rejecting doctors:', doctorIds);
        result = await Doctor.updateMany(
          { _id: { $in: doctorIds } },
          { 
            status: 'rejected',
            rejectionReason: reason || 'Rejected by admin',
            reviewedAt: new Date(),
            isVerified: false,
          }
        );
        break;

      case 'suspend':
        console.log('Suspending doctors:', doctorIds);
        result = await Doctor.updateMany(
          { _id: { $in: doctorIds } },
          { 
            isVerified: false,
            isSuspended: true,
            status: 'suspended',
            suspendedReason: reason || 'Suspended by admin',
            suspendedAt: new Date(),
          }
        );
        await User.updateMany(
          { 'doctorId': { $in: doctorIds } },
          { 
            isSuspended: true, 
            suspendedReason: reason || 'Suspended by admin',
            isVerified: false,
          }
        );
        break;

      case 'unsuspend':
        console.log('Unsuspending doctors:', doctorIds);
        result = await Doctor.updateMany(
          { _id: { $in: doctorIds } },
          { 
            isVerified: true,
            isSuspended: false,
            status: 'approved',
            suspendedReason: null,
            suspendedAt: null,
          }
        );
        await User.updateMany(
          { 'doctorId': { $in: doctorIds } },
          { 
            isSuspended: false, 
            suspendedReason: null,
            isVerified: true,
          }
        );
        break;

      case 'delete':
        console.log('Deleting doctors:', doctorIds);
        const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('_id email').lean();
        const doctorEmails = doctors.map(d => d.email);
        
        result = await Doctor.deleteMany({ _id: { $in: doctorIds } });
        await User.deleteMany({ email: { $in: doctorEmails } });
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