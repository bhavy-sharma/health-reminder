// app/api/user/profile/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Family from "@/models/Family";
import jwt from "jsonwebtoken";

// ── GET: Fetch user profile ──────────────────────────────────
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId)
      .select("-password -otp -resetToken")
      .populate("activeFamilyId");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// ── PUT: Update user profile ──────────────────────────────────
export async function PUT(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      fullName,
      mobile,
      email,
      address,
      profile,
    } = body;

    // Build update object
    const updateData = {};

    // Personal details
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (mobile !== undefined) updateData.mobile = mobile.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();

    // Address
    if (address !== undefined) {
      updateData.address = {
        street: address.street?.trim() || "",
        area: address.area?.trim() || "",
        landmark: address.landmark?.trim() || "",
        city: address.city?.trim() || "",
        district: address.district?.trim() || "",
        state: address.state?.trim() || "",
        pincode: address.pincode?.trim() || "",
        country: address.country?.trim() || "India",
      };
    }

    // Profile (medical info)
    if (profile !== undefined) {
      updateData.profile = {
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender || "other",
        bloodGroup: profile.bloodGroup || "",
        avatarColor: profile.avatarColor || "#6B7280",
      };
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .select("-password -otp -resetToken")
    .populate("activeFamilyId");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists. Please use a different ${field}.` },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return NextResponse.json(
        { error: errors[0] },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}