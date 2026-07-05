// app/api/admin/patients/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import User from "@/models/User";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";

// This is the correct way to handle params in Next.js App Router
export async function GET(request, context) {
  try {
    console.log('===== PATIENT DETAIL API =====');
    
    // IMPORTANT: The params are in context.params
    const params = await context.params;
    const id = params.id;
    
    console.log('Extracted ID from params:', id);
    
    if (!id) {
      console.log('No ID provided');
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // 1. Validate user role - ADMIN or STAFF only
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { 
          error: authResult.error || 'Authentication failed',
          message: authResult.reason || authResult.error,
          status: authResult.status 
        },
        { status: authResult.status || 401 }
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Find the user
    const user = await User.findById(id)
      .select('-password -otp -resetToken')
      .lean();
      
    if (!user) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // 4. Get family info
    let family = null;
    let familyMembers = [];
    let plan = 'Free';
    
    if (user.families && user.families.length > 0) {
      const activeFamily = user.families.find(f => f.isActive) || user.families[0];
      
      if (activeFamily && activeFamily.familyId) {
        family = await Family.findById(activeFamily.familyId).lean();
        
        if (family) {
          plan = family.plan?.type || 'Free';
          familyMembers = await FamilyMember.find({ 
            familyId: family._id,
            isActive: true 
          }).lean();
        }
      }
    }

    // 5. Return the patient data
    const patientData = {
      ...user,
      family,
      familyMembers,
      plan,
    };

    return NextResponse.json({
      success: true,
      data: patientData,
    });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch patient details" 
      },
      { status: 500 }
    );
  }
}