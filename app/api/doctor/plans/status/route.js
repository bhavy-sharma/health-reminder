// app/api/doctor/plans/status/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { checkPlanLimit } from "@/lib/plan-utils";

export async function GET(request) {
  try {
    console.log('===== PLAN STATUS API =====');
    
    const auth = await getAuthenticatedUser(request);
    
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: auth?.error || "Please login to continue" },
        { status: 401 }
      );
    }

    if (auth.isSuspended) {
      return NextResponse.json(
        { error: "Account suspended", reason: auth.suspendedReason },
        { status: 403 }
      );
    }

    if (auth.role !== 'doctor') {
      if (auth.hasDoctorProfile && auth.doctorStatus === 'pending') {
        return NextResponse.json(
          { error: "Your profile is under verification. Once it is verified, you will be able to access the dashboard." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Access denied. Doctor access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check plan limits
    const planCheck = await checkPlanLimit(auth.userId);
    
    if (planCheck.error) {
      return NextResponse.json(
        { error: planCheck.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        plan: planCheck.plan,
        used: planCheck.used,
        limit: planCheck.limit,
        remaining: planCheck.remaining,
        isUnlimited: planCheck.isUnlimited,
        hasReachedLimit: planCheck.hasReachedLimit,
        percentageUsed: planCheck.isUnlimited ? 0 : Math.min(100, (planCheck.used / planCheck.limit) * 100)
      }
    });

  } catch (error) {
    console.error("Plan status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plan status" },
      { status: 500 }
    );
  }
}