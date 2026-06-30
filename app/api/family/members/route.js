import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// GET - Get all family members
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

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json({ error: "Family ID is required" }, { status: 400 });
    }

    // Check if user belongs to this family
    const user = await User.findById(decoded.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === familyId);
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this family" },
        { status: 403 }
      );
    }

    const members = await FamilyMember.find({ 
      familyId, 
      isActive: true 
    }).sort({ isPrimary: -1, createdAt: 1 });

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error("Error fetching family members:", error);
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    );
  }
}

// POST - Add a new family member
export async function POST(request) {
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
      familyId,
      name,
      relationship,
      dateOfBirth,
      gender,
      bloodGroup,
      email,
      knownConditions = [],
      allergies = [],
      emergencyContact = {},
    } = body;

    if (!familyId || !name || !relationship || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has access to this family
    const user = await User.findById(decoded.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === familyId);
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this family" },
        { status: 403 }
      );
    }

    // Check if family exists
    const family = await Family.findById(familyId);
    if (!family) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    // Check for duplicate name
    const existingMember = await FamilyMember.findOne({
      familyId,
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isActive: true
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "A member with this name already exists" },
        { status: 400 }
      );
    }

    // Find user by email if provided
    let userId = null;
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        userId = existingUser._id;
      }
    }

    // Generate avatar color
    const avatarColors = [
      "#EF4444", "#F59E0B", "#10B981", "#3B82F6", 
      "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
      "#6366F1", "#84CC16", "#06B6D4", "#D946EF"
    ];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    // Create member using model
    const member = await FamilyMember.create({
      familyId,
      userId,
      name,
      relationship,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      bloodGroup: bloodGroup || undefined,
      avatarColor,
      knownConditions,
      allergies,
      emergencyContact,
      isPrimary: false,
      isActive: true,
    });

    // Add to family's members array
    family.members.push(member._id);
    await family.save();

    // If user exists, add family to user's families
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          families: {
            familyId: family._id,
            role: "member",
            joinedAt: new Date(),
          }
        }
      });
    }

    return NextResponse.json(
      { 
        message: "Family member added successfully",
        member 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding family member:", error);
    return NextResponse.json(
      { error: "Failed to add family member" },
      { status: 500 }
    );
  }
}