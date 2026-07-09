// app/api/doctor/plans/upgrade/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import Razorpay from "razorpay";

// Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
}

export async function POST(request) {
  try {
    console.log('===== UPGRADE PLAN API =====');
    
    const auth = await getAuthenticatedUser(request);
    
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    if (auth.role !== 'doctor') {
      return NextResponse.json(
        { error: "Access denied. Doctor access required." },
        { status: 403 }
      );
    }

    if (!razorpay) {
      return NextResponse.json(
        { 
          error: "Payment service is not configured. Please contact support.",
          code: "RAZORPAY_NOT_CONFIGURED"
        },
        { status: 500 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { 
          error: "Payment service is not properly configured. Missing API keys.",
          code: "RAZORPAY_KEYS_MISSING"
        },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { plan, billingCycle } = body;

    if (!plan || !['pro', 'premium'].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: "Invalid billing cycle" },
        { status: 400 }
      );
    }

    // Find doctor
    let doctor = await Doctor.findOne({ email: auth.email });
    if (!doctor) {
      doctor = await Doctor.findById(auth.userId);
    }

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Calculate amount
    const prices = {
      monthly: { pro: 999, premium: 2499 },
      annual: { pro: Math.floor(999 * 0.8), premium: Math.floor(2499 * 0.8) },
    };
    const amount = prices[billingCycle][plan];
    const amountInPaise = amount * 100;

    // ─── FIX: Create a short receipt (max 40 characters) ───
    const receipt = `${plan}_${doctor._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`;
    console.log('📝 Receipt:', receipt, 'Length:', receipt.length);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        doctorId: doctor._id.toString(),
        plan,
        billingCycle,
      },
    });

    // Create subscription record
    const subscription = new Subscription({
      doctorId: doctor._id,
      plan,
      billingCycle,
      status: "pending",
      amount,
      startDate: new Date(),
      endDate: new Date(),
      razorpayOrderId: order.id,
    });

    await subscription.save();

    // Create payment record
    const payment = new Payment({
      doctorId: doctor._id,
      subscriptionId: subscription._id,
      amount,
      currency: "INR",
      status: "pending",
      razorpayOrderId: order.id,
    });

    await payment.save();

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        subscriptionId: subscription._id,
        paymentId: payment._id,
        plan,
        billingCycle,
      },
    });

  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}