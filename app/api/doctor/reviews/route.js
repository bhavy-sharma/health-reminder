// app/api/doctor/reviews/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Review from "@/models/Review";
import Doctor from "@/models/Doctor";

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

function getTimeAgo(date) {
    if (!date) return 'Just now';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) === 1 ? '' : 's'} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
    return new Date(date).toLocaleDateString();
}

export async function GET(request) {
  try {
    console.log('===== DOCTOR REVIEWS API =====');
    
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
    const search = searchParams.get("search") || "";

    // Get all reviews for this doctor
    let reviews = await Review.find({
      doctorId: doctor._id,
    })
    .sort({ createdAt: -1 })
    .populate('memberId', 'name avatarColor')
    .lean();

    // Search filter
    let filteredReviews = reviews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReviews = reviews.filter(r => 
        r.text?.toLowerCase().includes(searchLower) ||
        r.authorName?.toLowerCase().includes(searchLower) ||
        (r.memberId?.name || '').toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const totalReviews = reviews.length;
    const flaggedReviews = reviews.filter(r => r.isFlagged).length;
    const repliedReviews = reviews.filter(r => r.doctorReply && r.doctorReply.length > 0).length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    });

    const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percent: totalReviews > 0 ? Math.round((breakdown[stars] / totalReviews) * 100) : 0,
      count: breakdown[stars]
    }));

    // Format reviews
    const formattedReviews = filteredReviews.map(r => ({
      id: r._id,
      patient: r.authorName || r.memberId?.name || 'Anonymous',
      initials: getInitials(r.authorName || r.memberId?.name || 'Anonymous'),
      color: r.memberId?.avatarColor || getAvatarColor(r.authorName || r.memberId?.name || 'Anonymous'),
      date: getTimeAgo(r.createdAt),
      rating: r.rating,
      text: r.text || '',
      helpful: r.helpfulCount || 0,
      helpfulClicked: false,
      replied: r.doctorReply && r.doctorReply.length > 0,
      replyText: r.doctorReply || '',
      flagged: r.isFlagged || false,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        stats: {
          total: totalReviews,
          avgRating: avgRating,
          flagged: flaggedReviews,
          needReply: totalReviews - repliedReviews,
          responseRate: totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0,
          ratingBreakdown: ratingBreakdown,
        },
        counts: {
          all: totalReviews,
          flagged: flaggedReviews,
          needReply: totalReviews - repliedReviews,
        }
      },
    });

  } catch (error) {
    console.error("Doctor reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}


// ── PUT: Update Review ─────────────────────────────────────────

export async function PUT(request) {
  try {
    console.log('===== DOCTOR REVIEWS UPDATE API =====');
    
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
    const { reviewId, action, replyText } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Verify doctor owns this review
    const doctor = await Doctor.findOne({ email: auth.email }).lean();
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    if (review.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this review" },
        { status: 403 }
      );
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'reply':
        if (!replyText || !replyText.trim()) {
          return NextResponse.json(
            { error: "Reply text is required" },
            { status: 400 }
          );
        }
        updateData.doctorReply = replyText.trim();
        updateData.doctorRepliedAt = new Date();
        message = "Reply posted successfully";
        break;

      case 'flag':
        updateData.isFlagged = true;
        message = "Review flagged successfully";
        break;

      case 'unflag':
        updateData.isFlagged = false;
        message = "Review unflagged successfully";
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { $set: updateData },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: message,
      data: {
        id: updatedReview._id,
        doctorReply: updatedReview.doctorReply,
        isFlagged: updatedReview.isFlagged,
        doctorRepliedAt: updatedReview.doctorRepliedAt,
      },
    });

  } catch (error) {
    console.error("Doctor reviews update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}