import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.otp || !user.otp.code) {
      return NextResponse.json(
        { error: "Invalid OTP request" },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(user.otp.expiresAt)) {
      return NextResponse.json(
        { error: "OTP has expired" },
        { status: 400 }
      );
    }

    // Check code match
    if (user.otp.code !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Generate temporary reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetToken = {
      token: resetToken,
      expiresAt: tokenExpires,
    };

    // Clear the OTP
    user.otp = undefined;

    await user.save();

    return NextResponse.json(
      { message: "OTP verified successfully", resetToken },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
