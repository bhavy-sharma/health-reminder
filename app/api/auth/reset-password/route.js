import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, resetToken, password, confirmPassword } = await request.json();

    if (!email || !resetToken || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.resetToken || !user.resetToken.token) {
      return NextResponse.json(
        { error: "Invalid password reset request" },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(user.resetToken.expiresAt)) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    // Check token match
    if (user.resetToken.token !== resetToken) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetToken = undefined; // clear the reset token

    await user.save();

    return NextResponse.json(
      { message: "Password reset successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
