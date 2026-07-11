// app/api/user/storage/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET(request) {
  try {
    console.log('===== STORAGE API =====');
    
    await connectToDatabase();

    const auth = await getAuthenticatedUser(request);
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    console.log('User ID:', auth.userId);

    // ─── Get the FULL user document to see all fields ───
    const user = await User.findById(auth.userId).lean();
    
    console.log('FULL USER OBJECT:', JSON.stringify(user, null, 2));
    console.log('Storage Used:', user.storageUsed);
    console.log('Storage Limit:', user.storageLimit);
    console.log('All keys:', Object.keys(user));

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if storage fields exist
    if (user.storageUsed === undefined) {
      console.log('⚠️ storageUsed field is MISSING from user document!');
      // Add default values
      user.storageUsed = 0;
      user.storageLimit = 1;
    }

    const storageUsed = user.storageUsed || 0;
    const storageLimit = user.storageLimit || 1;
    const remainingStorage = Math.max(0, storageLimit - storageUsed);
    const percentageUsed = storageLimit > 0 
      ? Math.min(100, (storageUsed / storageLimit) * 100) 
      : 0;

    console.log('Returning storage data:', {
      plan: user.plan || 'free',
      storageUsed,
      storageLimit,
      remainingStorage,
      percentageUsed,
    });

    return NextResponse.json({
      success: true,
      data: {
        plan: user.plan || 'free',
        storageUsed: storageUsed,
        storageLimit: storageLimit,
        remainingStorage: remainingStorage,
        percentageUsed: percentageUsed,
        isFull: remainingStorage <= 0,
      },
    });
  } catch (error) {
    console.error("Storage info error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch storage info" },
      { status: 500 }
    );
  }
}