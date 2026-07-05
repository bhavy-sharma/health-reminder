import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to validate patient access
async function validatePatientAccess(request) {
  const auth = await getAuthenticatedUser(request);
  
  // Check authentication
  if (!auth || !auth.authenticated) {
    if (auth?.isSuspended) {
      return { 
        valid: false, 
        error: "Account suspended", 
        reason: auth.suspendedReason || "Contact support",
        status: 403 
      };
    }
    return { 
      valid: false, 
      error: "Please login to continue", 
      status: 401 
    };
  }
  
  // Check suspension
  if (auth.isSuspended) {
    return { 
      valid: false, 
      error: "Account suspended", 
      reason: auth.suspendedReason || "Contact support",
      status: 403 
    };
  }
  
  // Check role - ONLY PATIENTS
  if (auth.role !== 'patient') {
    return { 
      valid: false, 
      error: "Access denied", 
      message: "Only patients can access family members",
      status: 403 
    };
  }
  
  return { valid: true, user: auth };
}

// GET - Get all family members
export async function GET(request) {
  try {
    await connectToDatabase();

    // Validate patient access
    const validation = await validatePatientAccess(request);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: validation.error, 
          message: validation.message,
          reason: validation.reason 
        },
        { status: validation.status }
      );
    }

    const auth = validation.user;
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json({ error: "Family ID is required" }, { status: 400 });
    }

    // Check if user belongs to this family
    const user = await User.findById(auth.userId);
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
    await connectToDatabase();

    // Validate patient access
    const validation = await validatePatientAccess(request);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: validation.error, 
          message: validation.message,
          reason: validation.reason 
        },
        { status: validation.status }
      );
    }

    const auth = validation.user;
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
      avatarBase64 = null,
    } = body;

    if (!familyId || !name || !relationship || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has access to this family
    const user = await User.findById(auth.userId);
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
    let memberUserId = null;
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        memberUserId = existingUser._id;
      }
    }

    // Generate avatar color
    const avatarColors = [
      "#EF4444", "#F59E0B", "#10B981", "#3B82F6", 
      "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"
    ];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    // Handle image upload if provided
    let uploadedAvatarUrl = null;
    if (avatarBase64) {
      try {
        const uploadRes = await cloudinary.uploader.upload(avatarBase64, {
          folder: "health-reminder/avatars",
        });
        uploadedAvatarUrl = uploadRes.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    const memberData = {
      familyId,
      userId: memberUserId,
      name,
      relationship,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      avatarColor: randomColor,
      avatarUrl: uploadedAvatarUrl,
      knownConditions,
      allergies,
      emergencyContact,
      isPrimary: false,
      isActive: true,
    };

    if (bloodGroup) {
      memberData.bloodGroup = bloodGroup;
    }

    const member = await FamilyMember.create(memberData);

    // Add to family's members list
    family.members.push(member._id);
    await family.save();

    // If a user account was linked, associate family with that user as well
    if (memberUserId) {
      const linkedUser = await User.findById(memberUserId);
      if (linkedUser) {
        if (!linkedUser.families) {
          linkedUser.families = [];
        }
        const alreadyLinked = linkedUser.families.some(f => f.familyId.toString() === familyId);
        if (!alreadyLinked) {
          linkedUser.families.push({
            familyId,
            role: "member",
            joinedAt: new Date()
          });
          if (!linkedUser.activeFamilyId) {
            linkedUser.activeFamilyId = familyId;
          }
          await linkedUser.save();
        }
      }
    }

    return NextResponse.json(
      { message: "Family member added successfully", member },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding family member:", error);
    return NextResponse.json(
      { error: "Failed to add family member", details: error.message },
      { status: 500 }
    );
  }
}