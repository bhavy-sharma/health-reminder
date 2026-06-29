import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { fullName, mobile, email, password, confirmPassword } = await request.json();

    if (!fullName || !mobile || !email || !password || !confirmPassword) {
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

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { mobile }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or mobile number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      fullName,
      mobile,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "patient",
    });

    // Create token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    // Set cookie
    const response = NextResponse.json(
      { message: "Registration successful", user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
