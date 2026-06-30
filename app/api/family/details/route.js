    import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import jwt from "jsonwebtoken";

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