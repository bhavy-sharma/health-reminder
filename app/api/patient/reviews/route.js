// app/api/patient/reviews/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Review from "@/models/Review";
import Doctor from "@/models/Doctor";
import FamilyMember from "@/models/FamilyMember";
import Family from "@/models/Family";

export async function GET(request) {
    try {
        console.log('===== PATIENT REVIEWS API =====');

        const auth = await getAuthenticatedUser(request);

        if (!auth || !auth.authenticated) {
            return NextResponse.json(
                { error: "Please login to continue" },
                { status: 401 }
            );
        }

        if (auth.role !== 'patient') {
            return NextResponse.json(
                { error: "Access denied. Only patients can view reviews." },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get("doctorId") || null;

        const user = await FamilyMember.findOne({ userId: auth.userId }).lean();
        
        let memberIds = [];
        let familyId = null;
        if (user) {
            familyId = user.familyId;
            const familyMembers = await FamilyMember.find({ 
                familyId: user.familyId,
                isActive: true 
            }).select('_id').lean();
            memberIds = familyMembers.map(m => m._id);
        }

        const query = {
            memberId: { $in: memberIds.length > 0 ? memberIds : [auth.userId] },
            isFlagged: false,
        };

        if (doctorId) {
            query.doctorId = doctorId;
        }

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .populate('doctorId', 'name specialty hospital avatarColor')
            .populate('memberId', 'name relationship avatarColor')
            .lean();

        const formattedReviews = reviews.map(review => ({
            id: review._id,
            doctorName: review.doctorId?.name || 'Unknown Doctor',
            doctorSpecialty: review.doctorId?.specialty || 'General',
            doctorInitials: getInitials(review.doctorId?.name || 'Unknown Doctor'),
            doctorColor: review.doctorId?.avatarColor || getAvatarColor(review.doctorId?.name || 'Unknown Doctor'),
            patientName: review.memberId?.name || review.authorName || 'You',
            rating: review.rating,
            text: review.text || '',
            date: new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            helpfulCount: review.helpfulCount || 0,
            doctorReply: review.doctorReply || null,
            doctorRepliedAt: review.doctorRepliedAt || null,
            isFlagged: review.isFlagged || false,
        }));

        return NextResponse.json({
            success: true,
            data: formattedReviews,
            total: formattedReviews.length,
        });
    } catch (error) {
        console.error("Patient reviews error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

// ── POST: Submit a review ──────────────────────────────────────

export async function POST(request) {
    try {
        console.log('===== SUBMIT REVIEW API =====');

        const auth = await getAuthenticatedUser(request);

        if (!auth || !auth.authenticated) {
            return NextResponse.json(
                { error: "Please login to continue" },
                { status: 401 }
            );
        }

        if (auth.role !== 'patient') {
            return NextResponse.json(
                { error: "Access denied. Only patients can submit reviews." },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const body = await request.json();
        const { doctorId, rating, text, memberId } = body;

        if (!doctorId) {
            return NextResponse.json(
                { error: "Doctor ID is required" },
                { status: 400 }
            );
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Please provide a valid rating (1-5)" },
                { status: 400 }
            );
        }

        // Get the family member info
        let member = null;
        if (memberId) {
            member = await FamilyMember.findById(memberId).lean();
        } else {
            member = await FamilyMember.findOne({ userId: auth.userId }).lean();
        }

        if (!member) {
            return NextResponse.json(
                { error: "Family member not found" },
                { status: 404 }
            );
        }

        // Get the family
        const family = await Family.findById(member.familyId).lean();
        if (!family) {
            return NextResponse.json(
                { error: "Family not found" },
                { status: 404 }
            );
        }

        // Check if user has already reviewed this doctor
        const existingReview = await Review.findOne({
            doctorId,
            memberId: member._id,
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "You have already reviewed this doctor" },
                { status: 409 }
            );
        }

        // Create the review with all required fields
        const review = new Review({
            doctorId,
            familyId: member.familyId,
            memberId: member._id,
            authorName: member.name,
            rating,
            text: text || '',
            isFlagged: false,
            helpfulCount: 0,
            isVerifiedPurchase: true, // Since it's from a booking
        });

        await review.save();

        // Update doctor's rating
        const allReviews = await Review.find({
            doctorId,
            isFlagged: false,
        });

        const totalReviews = allReviews.length;
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

        await Doctor.findByIdAndUpdate(doctorId, {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: totalReviews,
        });

        return NextResponse.json({
            success: true,
            message: "Review submitted successfully",
            data: review,
        });
    } catch (error) {
        console.error("Submit review error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to submit review" },
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