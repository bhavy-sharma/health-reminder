import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Family from "@/models/Family";
import User from "@/models/User";
import FamilyMember from "@/models/FamilyMember";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request) {
  try {
    console.log("=== POST /api/family/create START ===");
    
    await connectToDatabase();

    // 1. Get authenticated user
    const auth = await getAuthenticatedUser(request);
    
    // 2. Check authentication
    if (!auth || !auth.authenticated) {
      if (auth?.isSuspended) {
        return NextResponse.json(
          { 
            error: "Account suspended", 
            reason: auth.suspendedReason || "Contact support" 
          }, 
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Please login to continue" }, 
        { status: 401 }
      );
    }

    // 3. Check suspension
    if (auth.isSuspended) {
      return NextResponse.json(
        { 
          error: "Account suspended", 
          reason: auth.suspendedReason || "Contact support" 
        }, 
        { status: 403 }
      );
    }

    // 4. Check role - ONLY PATIENTS can create families
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can create family groups" 
        }, 
        { status: 403 }
      );
    }

    // 5. Proceed with family creation
    const body = await request.json();
    const { familyName } = body;

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.activeFamilyId) {
      // Return the existing family instead of erroring
      const existingFamily = await Family.findById(user.activeFamilyId);
      return NextResponse.json(
        {
          message: "Family already exists",
          family: existingFamily
            ? { _id: existingFamily._id, familyName: existingFamily.familyName }
            : { _id: user.activeFamilyId },
        },
        { status: 200 }
      );
    }

    console.log("Creating family...");
    const family = await Family.create({
      familyName: familyName || `${user.fullName}'s Family`,
      createdBy: user._id,
      members: [],
    });
    console.log("Family created:", family._id);

    console.log("Creating primary member...");
    const memberData = {
      familyId: family._id,
      userId: user._id,
      name: user.fullName || "User",
      relationship: "self",
      dateOfBirth: user.profile?.dateOfBirth || new Date("2000-01-01"),
      gender: user.profile?.gender || "other",
      avatarColor: user.profile?.avatarColor || "#6B7280",
      isPrimary: true,
      isActive: true,
      knownConditions: [],
      allergies: [],
      emergencyContact: {},
      notes: "",
    };

    if (user.profile?.bloodGroup) {
      memberData.bloodGroup = user.profile.bloodGroup;
    }

    const primaryMember = await FamilyMember.create(memberData);
    console.log("Primary member created:", primaryMember._id);

    family.members = [primaryMember._id];
    await family.save();

    await User.updateOne(
      { _id: user._id },
      {
        $set: { activeFamilyId: family._id },
        $addToSet: {
          families: {
            familyId: family._id,
            role: "admin",
            joinedAt: new Date(),
          },
        },
      }
    );

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