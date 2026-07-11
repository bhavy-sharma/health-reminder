// app/api/payment/verify/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import User from "@/models/User";
import crypto from "crypto";
import { getStorageLimit } from "@/lib/plan-limits";

export async function POST(request) {
  try {
    console.log('===== VERIFY PAYMENT API =====');
    
    const auth = await getAuthenticatedUser(request);
    
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
    } = body;

    // Verify signature
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // ─── UPDATE USER'S PLAN ───
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get storage limit for the plan
    const storageLimit = getStorageLimit(planId);
    
    // Update user's plan and storage
    user.plan = planId;
    user.storageLimit = storageLimit;
    
    // Update subscription details
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now
    
    user.subscription = {
      plan: planId,
      status: 'active',
      billingCycle: 'monthly',
      startDate: new Date(),
      expiresAt: expiresAt,
      paymentId: razorpay_payment_id,
    };

    await user.save();
    console.log(`✅ User plan updated to: ${planId}`);
    console.log(`✅ Storage limit updated to: ${storageLimit} GB`);

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan activated successfully",
      data: {
        planId,
        storageLimit,
        expiresAt: expiresAt,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}