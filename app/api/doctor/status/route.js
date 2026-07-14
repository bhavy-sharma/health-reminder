// app/api/doctor/status/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Doctor from "@/models/Doctor";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request);
    
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: auth?.error || "Please login to continue" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const doctor = await Doctor.findOne({ 
      email: auth.email 
    }).select('name status isVerified rejectionReason suspendedReason');

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      name: doctor.name,
      status: doctor.status,
      isVerified: doctor.isVerified,
      rejectionReason: doctor.rejectionReason,
      suspendedReason: doctor.suspendedReason,
    });
  } catch (error) {
    console.error("Error fetching doctor status:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor status" },
      { status: 500 }
    );
  }
}