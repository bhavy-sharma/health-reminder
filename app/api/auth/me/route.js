// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    // Try to find user in User model first
    let user = await User.findById(decoded.userId || decoded.sub)
      .select("-password -otp -resetToken")
      .lean();

    // If not found in User, try Doctor model
    if (!user) {
      const doctor = await Doctor.findById(decoded.doctorId || decoded.userId || decoded.sub)
        .select("-password")
        .lean();

      if (doctor) {
        // Return doctor as user with role 'doctor'
        return NextResponse.json({
          user: {
            id: doctor._id,
            fullName: doctor.name,
            email: doctor.email,
            mobile: doctor.phone,
            role: "doctor",
            isVerified: doctor.isVerified,
            isSuspended: doctor.isSuspended,
            specialty: doctor.specialty,
            medicalRegNo: doctor.medicalRegNo,
            status: doctor.status,
          }
        }, { status: 200 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}