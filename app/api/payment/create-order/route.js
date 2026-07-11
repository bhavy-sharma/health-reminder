// app/api/payment/create-order/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request) {
  try {
    console.log('===== CREATE PAYMENT ORDER API =====');
    
    // Check environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { 
          error: "Payment service is not configured.",
          code: "MISSING_CREDENTIALS"
        },
        { status: 500 }
      );
    }

    // Check authentication
    const auth = await getAuthenticatedUser(request);
    
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { planId, amount, planName } = body;

    if (!planId || !amount) {
      return NextResponse.json(
        { error: "Plan ID and amount are required" },
        { status: 400 }
      );
    }

    // Import Razorpay
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay order with SHORT receipt
    const amountInPaise = amount * 100;
    
    // ─── FIX: Short receipt (max 40 characters) ───
    const receipt = `${planId}_${auth.userId.toString().slice(-8)}_${Date.now().toString().slice(-4)}`;
    console.log('Receipt:', receipt, 'Length:', receipt.length);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        userId: auth.userId.toString(),
        planId,
        planName,
      },
    });
    console.log('✅ Razorpay order created:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("Payment order error:", error);
    
    // Specific error messages
    if (error.statusCode === 400) {
      return NextResponse.json(
        { 
          error: "Invalid payment request. Please try again.",
          details: error.error?.description || error.message,
          code: "INVALID_REQUEST"
        },
        { status: 400 }
      );
    }
    
    if (error.statusCode === 401) {
      return NextResponse.json(
        { 
          error: "Payment service authentication failed.",
          details: error.error?.description || error.message,
          code: "AUTH_FAILED"
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to create order",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}