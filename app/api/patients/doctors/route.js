// app/api/patients/doctors/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Doctor from "@/models/Doctor";
import Review from "@/models/Review";

export async function GET(request) {
  try {
    console.log('===== FIND DOCTORS API =====');
    
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const specialty = searchParams.get("specialty") || "All";
    const quickFilter = searchParams.get("quickFilter") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "rating"; // rating, distance, fee, experience

    // Build query - only show approved and verified doctors
    const query = { 
      status: "approved",
      isVerified: true,
      isSuspended: false,
    };
    
    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { specialty: searchRegex },
        { hospital: searchRegex },
        { city: searchRegex },
        { conditions: searchRegex },
      ];
    }

    // Specialty filter
    if (specialty !== "All") {
      query.specialty = { $regex: specialty, $options: 'i' };
    }

    // Quick filter - search in conditions
    if (quickFilter) {
      query.conditions = { $regex: quickFilter, $options: 'i' };
    }

    // Get total count
    const total = await Doctor.countDocuments(query);

    // Build sort options
    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'fee':
        sortOption = { consultationFee: 1 };
        break;
      case 'experience':
        sortOption = { experience: -1 };
        break;
      case 'distance':
        // Default sort by rating if distance not available
        sortOption = { rating: -1 };
        break;
      default:
        sortOption = { rating: -1 };
    }

    // Get doctors with pagination
    const doctors = await Doctor.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password')
      .lean();

    // Get review stats for each doctor
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

        // Calculate distance (mock for now - would use geolocation in production)
        const distance = (Math.random() * 5 + 0.5).toFixed(1);

        return {
          id: doctor._id,
          name: doctor.name,
          initials: getInitials(doctor.name),
          color: doctor.avatarColor || getRandomColor(),
          specialty: doctor.specialty || 'General',
          hospital: doctor.hospital || 'Private Practice',
          rating: Math.round(avgRating * 10) / 10 || 0,
          reviews: totalReviews,
          distance: `${distance} km`,
          experience: `${doctor.experience || 0} yrs exp`,
          nextSlot: getNextSlot(),
          tags: doctor.conditions?.slice(0, 4) || [],
          languages: doctor.languages || ['English'],
          fee: doctor.consultationFee || 0,
          verified: doctor.isVerified || false,
          city: doctor.city,
          about: doctor.about,
          tagline: doctor.tagline,
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
          quickFilter,
          sortBy,
        },
      },
    });
  } catch (error) {
    console.error("Find doctors error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch doctors" 
      },
      { status: 500 }
    );
  }
}

// ── GET: Doctor Details ──────────────────────────────────────

export async function GET_DOCTOR(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    
    const doctor = await Doctor.findById(id)
      .select('-password')
      .lean();

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Get reviews
    const reviews = await Review.find({ 
      doctorId: doctor._id,
      isFlagged: false 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    // Get available slots
    const today = new Date();
    const availableSlots = doctor.appointmentSlots || [];

    return NextResponse.json({
      success: true,
      data: {
        ...doctor,
        stats: {
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews,
        },
        reviews: reviews.slice(0, 5),
        availableSlots,
      },
    });
  } catch (error) {
    console.error("Doctor details error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch doctor details" 
      },
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

function getRandomColor() {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
    '#06B6D4', '#D946EF', '#6B7280', '#1E40AF', '#BE185D'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getNextSlot() {
  const slots = [
    'Today, 4:30 PM',
    'Today, 6:00 PM',
    'Tomorrow, 10:00 AM',
    'Tomorrow, 2:30 PM',
    'Wed, 11:30 AM',
    'Thu, 9:00 AM',
    'Fri, 3:00 PM',
  ];
  return slots[Math.floor(Math.random() * slots.length)];
}