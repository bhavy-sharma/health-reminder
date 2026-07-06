// app/api/doctor/auth/login/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find doctor - explicitly select password field
    const doctor = await Doctor.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!doctor) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check status
    if (doctor.status === "pending") {
      return NextResponse.json(
        { 
          error: "Your account is pending admin approval.",
          status: "pending"
        },
        { status: 403 }
      );
    }

    if (doctor.status === "rejected") {
      return NextResponse.json(
        { 
          error: "Your application has been rejected.",
          status: "rejected",
          reason: doctor.rejectionReason
        },
        { status: 403 }
      );
    }

    if (doctor.status === "suspended") {
      return NextResponse.json(
        { 
          error: "Your account has been suspended.",
          status: "suspended",
          reason: doctor.suspendedReason
        },
        { status: 403 }
      );
    }

    if (doctor.status !== "approved") {
      return NextResponse.json(
        { 
          error: `Your account is ${doctor.status}. Please contact support.`,
          status: doctor.status
        },
        { status: 403 }
      );
    }

    // Check password
    if (!doctor.password) {
      return NextResponse.json(
        { 
          error: "Account setup incomplete. Please reset your password.",
          code: "NO_PASSWORD"
        },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create token
    const token = jwt.sign(
      { 
        doctorId: doctor._id,
        userId: doctor._id,  // ← Add this for compatibility
        email: doctor.email, 
        role: "doctor",
        status: doctor.status 
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        doctor: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialty: doctor.specialty,
          isVerified: doctor.isVerified,
          status: doctor.status,
        },
      },
      { status: 200 }
    );

    // Set cookie with proper options
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",  // ← Changed from 'strict' to 'lax'
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Doctor login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}