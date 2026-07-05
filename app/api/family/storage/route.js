import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Family from '@/models/Family';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Get family storage usage
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

    // 4. Check role - ONLY PATIENTS can access storage
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can access family storage" 
        }, 
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    // Check if user belongs to this family
    const user = await User.findById(auth.userId);
    const hasAccess = user.families.some(f => f.familyId.toString() === familyId);
    
    if (!hasAccess && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have access to this family' },
        { status: 403 }
      );
    }

    const family = await Family.findById(familyId);
    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    const storageData = {
      used: family.storageUsed || 0,
      limit: family.storageLimit || 5,
      percentage: family.storageLimit > 0 ? ((family.storageUsed || 0) / family.storageLimit) * 100 : 0,
    };

    return NextResponse.json({ storage: storageData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching storage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage data' },
      { status: 500 }
    );
  }
}