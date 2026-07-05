// app/api/admin/reviews/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Review from "@/models/Review";
import Doctor from "@/models/Doctor";
import FamilyMember from "@/models/FamilyMember";

export async function GET(request) {
  try {
    console.log('===== REVIEWS API CALLED =====');
    
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

    console.log('Reviews API: Access granted');

    // 2. Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "All Status";
    const rating = searchParams.get("rating") || "All Ratings";
    const showFlagged = searchParams.get("showFlagged") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Build query
    const query = {};
    
    // Status filter
    if (status !== "All Status") {
      query.isFlagged = status === 'flagged';
    }

    // Rating filter
    if (rating !== "All Ratings") {
      query.rating = parseInt(rating);
    }

    // Show flagged only
    if (showFlagged) {
      query.isFlagged = true;
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      // Find doctors matching search
      const matchingDoctors = await Doctor.find({
        name: searchRegex
      }).select('_id').lean();
      
      const doctorIds = matchingDoctors.map(d => d._id);
      
      // Find family members matching search
      const matchingMembers = await FamilyMember.find({
        name: searchRegex
      }).select('_id').lean();
      
      const memberIds = matchingMembers.map(m => m._id);
      
      query.$or = [
        { text: searchRegex },
        { authorName: searchRegex },
        { doctorId: { $in: doctorIds } },
        { memberId: { $in: memberIds } },
      ];
    }

    // Get total count
    const total = await Review.countDocuments(query);
    console.log(`Total reviews found: ${total}`);

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('doctorId', 'name specialty city')
      .populate('memberId', 'name relationship avatarColor')
      .lean();

    console.log(`Returning ${reviews.length} reviews for page ${page}`);

    // Format reviews
    const formattedReviews = reviews.map((review) => {
      const doctorName = review.doctorId?.name || 'Unknown Doctor';
      const patientName = review.memberId?.name || review.authorName || 'Unknown Patient';
      
      return {
        id: review._id,
        doctorInitials: getInitials(doctorName),
        doctorColor: getAvatarColor(doctorName),
        doctorName: doctorName,
        doctorId: review.doctorId?._id,
        patientInitials: getInitials(patientName),
        patientColor: review.memberId?.avatarColor || getAvatarColor(patientName),
        patientName: patientName,
        memberId: review.memberId?._id,
        date: review.createdAt,
        rating: review.rating,
        status: review.isFlagged ? 'flagged' : 'published',
        text: review.text,
        isFlagged: review.isFlagged,
        helpfulCount: review.helpfulCount || 0,
        doctorReply: review.doctorReply,
        doctorRepliedAt: review.doctorRepliedAt,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

    // Get counts
    const flaggedCount = await Review.countDocuments({ isFlagged: true });
    const publishedCount = await Review.countDocuments({ isFlagged: false });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        total,
        page,
        limit,
        totalPages,
        filters: {
          search,
          status,
          rating,
          showFlagged,
        },
        stats: {
          flagged: flaggedCount,
          published: publishedCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch reviews" 
      },
      { status: 500 }
    );
  }
}

// ── POST: Review actions ──────────────────────────────────────

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
    const { action, reviewIds, reason } = body;

    if (!action || !reviewIds || reviewIds.length === 0) {
      return NextResponse.json(
        { error: "Action and reviewIds are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'approve':
        console.log('Approving reviews:', reviewIds);
        result = await Review.updateMany(
          { _id: { $in: reviewIds } },
          { 
            isFlagged: false,
          }
        );
        break;

      case 'flag':
        console.log('Flagging reviews:', reviewIds);
        result = await Review.updateMany(
          { _id: { $in: reviewIds } },
          { 
            isFlagged: true,
          }
        );
        break;

      case 'delete':
        console.log('Deleting reviews:', reviewIds);
        result = await Review.deleteMany(
          { _id: { $in: reviewIds } }
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
    console.error("Error updating reviews:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to update reviews" 
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