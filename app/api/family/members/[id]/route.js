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

// GET - Get a single family member
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const member = await FamilyMember.findById(id);
    if (!member) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this family
    const user = await User.findById(auth.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === member.familyId.toString());
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this family member" },
        { status: 403 }
      );
    }

    return NextResponse.json({ member }, { status: 200 });
  } catch (error) {
    console.error("Error fetching family member:", error);
    return NextResponse.json(
      { error: "Failed to fetch family member" },
      { status: 500 }
    );
  }
}

// PUT - Update a family member
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      relationship,
      dateOfBirth,
      gender,
      bloodGroup,
      knownConditions,
      allergies,
      emergencyContact,
      notes,
      isActive,
      avatarBase64,
    } = body;

    // Check if member exists
    const member = await FamilyMember.findById(id);
    if (!member) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this family
    const user = await User.findById(auth.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === member.familyId.toString());
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this family member" },
        { status: 403 }
      );
    }

    // Check if trying to deactivate primary member
    if (member.isPrimary && isActive === false) {
      return NextResponse.json(
        { error: "Cannot deactivate the primary family member" },
        { status: 400 }
      );
    }

    // Handle image upload if provided
    let uploadedAvatarUrl = member.avatarUrl;
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

    // Update member
    const updatedMember = await FamilyMember.findByIdAndUpdate(
      id,
      {
        name: name || member.name,
        relationship: relationship || member.relationship,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : member.dateOfBirth,
        gender: gender || member.gender,
        bloodGroup: bloodGroup || member.bloodGroup,
        avatarUrl: uploadedAvatarUrl,
        knownConditions: knownConditions || member.knownConditions,
        allergies: allergies || member.allergies,
        emergencyContact: emergencyContact || member.emergencyContact,
        notes: notes || member.notes,
        isActive: isActive !== undefined ? isActive : member.isActive,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { 
        message: "Family member updated successfully",
        member: updatedMember 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating family member:", error);
    return NextResponse.json(
      { error: "Failed to update family member", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a family member
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if member exists
    const member = await FamilyMember.findById(id);
    if (!member) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this family
    const user = await User.findById(auth.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === member.familyId.toString());
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this family member" },
        { status: 403 }
      );
    }

    // Check if trying to delete primary member
    if (member.isPrimary) {
      return NextResponse.json(
        { error: "Cannot delete the primary family member" },
        { status: 400 }
      );
    }

    // Soft delete
    member.isActive = false;
    await member.save();

    // Remove from family's members array
    await Family.findByIdAndUpdate(member.familyId, {
      $pull: { members: id }
    });

    // Remove from user's families if linked
    if (member.userId) {
      await User.findByIdAndUpdate(member.userId, {
        $pull: { 
          families: { familyId: member.familyId }
        }
      });
    }

    return NextResponse.json(
      { message: "Family member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting family member:", error);
    return NextResponse.json(
      { error: "Failed to delete family member", details: error.message },
      { status: 500 }
    );
  }
}