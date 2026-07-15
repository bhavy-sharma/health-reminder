// app/api/admin/patients/export/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import User from "@/models/User";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";

export async function GET(request) {
  try {
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status || 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const search = searchParams.get('search') || "";
    const plan = searchParams.get('plan') || "All Plans";
    const status = searchParams.get('status') || "All Status";

    // Build query for Users with role 'patient'
    const query = { role: 'patient' };
    
    // If specific IDs are provided, fetch only those
    if (ids) {
      const idArray = ids.split(',').filter(id => id.trim());
      query._id = { $in: idArray };
    } else {
      // Apply filters like the main GET endpoint
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { fullName: searchRegex },
          { email: searchRegex },
          { mobile: searchRegex },
        ];
      }

      if (status !== "All Status") {
        if (status === 'active') {
          query.isSuspended = false;
          query.isVerified = true;
        } else if (status === 'suspended') {
          query.isSuspended = true;
        } else if (status === 'inactive') {
          query.isVerified = false;
          query.isSuspended = false;
        }
      }
    }

    // Get all users matching the query (no pagination for export)
    const users = await User.find(query)
      .select('fullName email mobile city role isVerified isSuspended families createdAt address plan')
      .sort({ createdAt: -1 })
      .lean();

    // Process each user
    const patientsWithDetails = await Promise.all(
      users.map(async (user) => {
        let family = null;
        let familyMembers = [];
        let planType = 'Free';
        
        // Get user's primary family
        if (user.families && user.families.length > 0) {
          const activeFamily = user.families.find(f => f.isActive) || user.families[0];
          
          if (activeFamily) {
            family = await Family.findById(activeFamily.familyId).lean();
            
            if (family) {
              familyMembers = await FamilyMember.find({ 
                familyId: family._id,
                isActive: true 
              })
              .select('name email city phone relationship')
              .lean();
            }
          }
        }

        // Determine status
        let userStatus = 'active';
        if (user.isSuspended) {
          userStatus = 'suspended';
        } else if (!user.isVerified) {
          userStatus = 'inactive';
        }

        // Get city from user's address or fallback to primary member's city
        let city = 'Unknown';
        if (user.address?.city) {
          city = user.address.city;
        } else {
          const primaryMember = familyMembers.find(m => m.isPrimary) || familyMembers[0];
          if (primaryMember?.city) {
            city = primaryMember.city;
          }
        }
        
        // Get plan from user's direct plan field
        let userPlan = user.plan || 'free';
        let planDisplay = userPlan.charAt(0).toUpperCase() + userPlan.slice(1);
        
        // If user has no plan or it's 'free', check family plan as fallback
        if (userPlan === 'free' && family) {
          const familyPlan = family.plan?.type || 'Free';
          if (familyPlan !== 'Free') {
            planDisplay = familyPlan;
          }
        }
        
        // Format join date - FIXED: properly format the date
        let joinDate = 'N/A';
        if (user.createdAt) {
          const date = new Date(user.createdAt);
          joinDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        
        return {
          id: user._id.toString(),
          name: user.fullName || 'Unknown',
          email: user.email || '',
          phone: user.mobile || '',
          city: city,
          plan: planDisplay,
          members: familyMembers.length || 0,
          status: userStatus,
          joinDate: joinDate, // This is now a string, not a Date object
        };
      })
    );

    // Apply plan filter
    let filteredPatients = patientsWithDetails;
    if (plan !== "All Plans") {
      filteredPatients = filteredPatients.filter(p => {
        const userPlan = p.plan.toLowerCase();
        return userPlan === plan.toLowerCase();
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        patients: filteredPatients,
        total: filteredPatients.length,
      },
    });
  } catch (error) {
    console.error("Error exporting patients:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to export patients" 
      },
      { status: 500 }
    );
  }
}