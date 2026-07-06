// app/api/patients/doctors/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Doctor from "@/models/Doctor";
import Review from "@/models/Review";

export async function GET(request) {
  try {
    console.log('===== DOCTOR DETAIL API =====');
    console.log('Request URL:', request.url);
    
    // Extract ID from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // The ID should be the last part of the path
    // /api/patients/doctors/[id] -> id is at the end
    const id = pathParts[pathParts.length - 1];
    
    console.log('Extracted ID from URL path:', id);
    
    if (!id || id === 'doctors' || id === 'patients') {
      console.log('No valid ID provided');
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const doctor = await Doctor.findById(id)
      .select('-password')
      .lean();

    if (!doctor) {
      console.log('Doctor not found:', id);
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

    return NextResponse.json({
      success: true,
      data: {
        ...doctor,
        stats: {
          avgRating: Math.round(avgRating * 10) / 10 || 0,
          totalReviews,
        },
        reviews: reviews.slice(0, 5),
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