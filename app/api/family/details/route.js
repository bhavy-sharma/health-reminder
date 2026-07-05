import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request) {
  try {
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

    // 4. Check role - ONLY PATIENTS can access family details
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can access family details" 
        }, 
        { status: 403 }
      );
    }

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

    // Get family details
    const family = await Family.findById(familyId);
    if (!family) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    // Get family members (only first 5 for the sidebar)
    const members = await FamilyMember.find({ 
      familyId, 
      isActive: true 
    })
    .sort({ isPrimary: -1, createdAt: 1 })
    .limit(5)
    .select('name isPrimary');

    return NextResponse.json({ 
      family: {
        familyName: family.familyName,
        storageUsed: family.storageUsed || 0,
        storageLimit: family.storageLimit || 5,
        plan: family.plan || 'Family Plan',
      },
      members 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching family details:", error);
    return NextResponse.json(
      { error: "Failed to fetch family details" },
      { status: 500 }
    );
  }
}