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
    const sortBy = searchParams.get("sortBy") || "rating";
    
    // Location filters
    const city = searchParams.get("city") || "";
    const district = searchParams.get("district") || "";
    const state = searchParams.get("state") || "";

    // Build query - only show approved and verified doctors
    const query = { 
      status: "approved",
      isVerified: true,
      isSuspended: false,
    };
    
    // Location based filtering
    if (city || district || state) {
      query.$or = [];
      
      if (city) {
        query.$or.push({ 
          $or: [
            { "address.city": { $regex: city, $options: 'i' } },
            { city: { $regex: city, $options: 'i' } }
          ]
        });
      }
      
      if (district) {
        query.$or.push({ "address.district": { $regex: district, $options: 'i' } });
      }
      
      if (state) {
        query.$or.push({ 
          $or: [
            { "address.state": { $regex: state, $options: 'i' } },
            { state: { $regex: state, $options: 'i' } }
          ]
        });
      }
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = query.$or || [];
      query.$or.push(
        { name: searchRegex },
        { specialty: searchRegex },
        { hospital: searchRegex },
        { "address.city": searchRegex },
        { conditions: searchRegex },
      );
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

    // ─── Build sort options with plan priority ───
    let sortOption = {};
    
    // Always sort by plan priority first: Premium → Pro → Free
    sortOption['plan.type'] = 1;

    // Then apply additional sorting based on sortBy parameter
    switch (sortBy) {
      case 'rating':
        sortOption = { 
          'plan.type': 1, 
          rating: -1 
        };
        break;
      case 'fee':
        sortOption = { 
          'plan.type': 1, 
          consultationFee: 1 
        };
        break;
      case 'experience':
        sortOption = { 
          'plan.type': 1, 
          experience: -1 
        };
        break;
      case 'distance':
        sortOption = { 
          'plan.type': 1, 
          rating: -1 
        };
        break;
      default:
        sortOption = { 
          'plan.type': 1, 
          rating: -1 
        };
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

        // Calculate distance based on address similarity
        let distance = 'Unknown';
        if (city && doctor.address?.city) {
          if (doctor.address.city.toLowerCase() === city.toLowerCase()) {
            distance = 'Nearby';
          } else if (doctor.address.district?.toLowerCase() === district?.toLowerCase()) {
            distance = 'In your district';
          } else if (doctor.address.state?.toLowerCase() === state?.toLowerCase()) {
            distance = 'In your state';
          } else {
            distance = 'Other location';
          }
        }

        // ─── Check doctor's plan ───
        const plan = doctor.plan?.type || 'free';
        const isPro = plan === 'pro' || plan === 'premium';
        const isPremium = plan === 'premium';
        const planLabel = plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Premium';
        const planPriority = plan === 'premium' ? 1 : plan === 'pro' ? 2 : 3;
        
        // ─── Check if video is available ───
        const hasVideo = isPro && 
            doctor.videoConsultFee !== undefined && 
            doctor.videoConsultFee !== null && 
            doctor.videoConsultFee > 0;

        return {
          id: doctor._id,
          name: doctor.name,
          initials: getInitials(doctor.name),
          color: doctor.avatarColor || getRandomColor(),
          specialty: doctor.specialty || 'General',
          hospital: doctor.hospital || 'Private Practice',
          rating: Math.round(avgRating * 10) / 10 || 0,
          reviews: totalReviews,
          distance: distance,
          experience: `${doctor.experience || 0} yrs exp`,
          tags: doctor.conditions?.slice(0, 4) || [],
          languages: doctor.languages || ['English'],
          consultationFee: doctor.consultationFee || 0,
          videoConsultFee: doctor.videoConsultFee || 0,
          verified: doctor.isVerified || false,
          plan: plan,
          isPro: isPro,
          isPremium: isPremium,
          planLabel: planLabel,
          planPriority: planPriority,
          hasBadge: isPro,
          hasVideo: hasVideo,
          city: doctor.city,
          address: doctor.address,
          about: doctor.about,
          tagline: doctor.tagline,
        };
      })
    );

    // ─── Sort doctors by plan priority (Premium first, then Pro, then Free) ───
    doctorsWithStats.sort((a, b) => a.planPriority - b.planPriority);

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
          location: { city, district, state },
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