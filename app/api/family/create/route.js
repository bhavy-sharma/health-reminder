import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Family from "@/models/Family";
import User from "@/models/User";
import FamilyMember from "@/models/FamilyMember";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    console.log("=== POST /api/family/create START ===");
    
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
    const { familyName } = body;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.activeFamilyId) {
      return NextResponse.json({ error: "You already have a family" }, { status: 400 });
    }

    console.log("Creating family...");
    const family = await Family.create({
      familyName: familyName || `${user.fullName}'s Family`,
      createdBy: user._id,
      members: [],
    });
    console.log("Family created:", family._id);

    console.log("Creating primary member...");
    const primaryMember = await FamilyMember.create({
      familyId: family._id,
      userId: user._id,
      name: user.fullName || "User",
      relationship: "self",
      dateOfBirth: user.profile?.dateOfBirth || new Date("2000-01-01"),
      gender: user.profile?.gender || "other",
      bloodGroup: user.profile?.bloodGroup || null,
      avatarColor: user.profile?.avatarColor || "#6B7280",
      isPrimary: true,
      isActive: true,
      knownConditions: [],
      allergies: [],
      emergencyContact: {},
      notes: "",
    });
    console.log("Primary member created:", primaryMember._id);

    family.members = [primaryMember._id];
    await family.save();

    user.activeFamilyId = family._id;
    if (!user.families) {
      user.families = [];
    }
    user.families.push({
      familyId: family._id,
      role: "admin",
      joinedAt: new Date(),
    });
    await user.save();

    return NextResponse.json(
      {
        message: "Family created successfully",
        family: {
          _id: family._id,
          familyName: family.familyName,
        },
        primaryMember: {
          _id: primaryMember._id,
          name: primaryMember.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating family:", error);
    return NextResponse.json(
      { 
        error: "Failed to create family",
        details: error.message,
      },
      { status: 500 }
    );
  }
}