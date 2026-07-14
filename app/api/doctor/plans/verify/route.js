// app/api/doctor/plans/verify/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);
    
    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: auth?.error || "Please login to continue" },
        { status: 401 }
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

    const body = await request.json();
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      subscriptionId,
      plan,
      billingCycle 
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

    // Find subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Find payment
    const payment = await Payment.findOne({ 
      razorpayOrderId: razorpay_order_id 
    });
    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update subscription
    subscription.status = "active";
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.paymentId = razorpay_payment_id;
    subscription.startDate = new Date();
    
    // Set end date based on billing cycle
    const endDate = new Date();
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    subscription.endDate = endDate;

    await subscription.save();

    // Update payment
    payment.status = "success";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Update doctor's plan
    await Doctor.findByIdAndUpdate(auth.userId, {
      'plan.type': plan,
      'plan.billingCycle': billingCycle,
      'plan.expiresAt': endDate,
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        plan,
        billingCycle,
        expiresAt: endDate,
      },
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}