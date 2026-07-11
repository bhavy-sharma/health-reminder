// app/api/user/plan/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET(request) {
  try {
    console.log('===== GET USER PLAN API =====');
    
    const auth = await getAuthenticatedUser(request);
    
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(auth.userId)
      .select('plan subscription')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log('User plan from DB:', user.plan);
    console.log('User subscription:', user.subscription);

    const hasSubscription = user.subscription && user.subscription.status === 'active';
    const plan = user.plan || 'free';
    const isActive = hasSubscription && new Date(user.subscription.expiresAt) > new Date();

    const planDetails = {
      plan: plan,
      planName: plan === 'free' ? 'Free' : plan === 'family' ? 'Family' : 'Premium',
      isActive: isActive || plan === 'free',
      hasSubscription: !!hasSubscription,
      expiresAt: user.subscription?.expiresAt || null,
      billingCycle: user.subscription?.billingCycle || null,
      features: getPlanFeatures(plan),
    };

    console.log('Returning plan details:', planDetails);

    return NextResponse.json({
      success: true,
      data: planDetails,
    });

  } catch (error) {
    console.error("Get user plan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

function getPlanFeatures(plan) {
  const features = {
    free: [
      "2 family members",
      "1 GB storage",
      "WhatsApp reminders",
      "Basic records",
    ],
    family: [
      "Unlimited members",
      "5 GB storage",
      "WhatsApp reminders",
      "Doctor PDF sharing",
      "Priority support",
    ],
    premium: [
      "Everything in Family",
      "20 GB storage",
      "AI health insights",
      "ABHA integration",
      "Dedicated support",
    ],
  };
  return features[plan] || features.free;
}