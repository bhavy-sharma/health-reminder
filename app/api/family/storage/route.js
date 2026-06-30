import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Family from '@/models/Family';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Get family storage usage
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    // Check if user belongs to this family
    const user = await User.findById(session.user.id);
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
      used: family.storageUsed,
      limit: family.storageLimit,
      percentage: (family.storageUsed / family.storageLimit) * 100,
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