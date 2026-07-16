// app/api/doctor/plans/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";

export async function GET(request) {
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

    // Get current subscription
    const currentSubscription = await Subscription.findOne({
      doctorId: doctor._id,
      status: "active"
    }).sort({ endDate: -1 });

    // Get upcoming subscription (if any)
    const upcomingSubscription = await Subscription.findOne({
      doctorId: doctor._id,
      status: "pending"
    }).sort({ createdAt: -1 });

    // Get payment history (last 12 months)
    const paymentHistory = await Payment.find({
      doctorId: doctor._id,
      status: "success"
    })
    .sort({ createdAt: -1 })
    .limit(12)
    .populate('subscriptionId', 'plan billingCycle');

    // Calculate plan limits
    const planLimits = {
      free: {
        bookingsPerMonth: 10,
        maxPatients: 50,
        features: [
          'Basic profile listing',
          'Up to 10 bookings / month',
          'Patient reviews & ratings',
          'Standard search placement',
        ],
      },
      pro: {
        bookingsPerMonth: 100,
        maxPatients: 500,
        features: [
          'Everything in Free',
          'Up to 50 bookings / month',
          'Priority search placement',
          'Verified badge boost',
          'Basic analytics dashboard',
          'WhatsApp appointment reminders',
          'Video consultation support',
        ],
      },
      premium: {
        bookingsPerMonth: Infinity,
        maxPatients: Infinity,
        features: [
          'Everything in Pro',
          '150 bookings',
          'Top placement — disease searches',
          'Advanced analytics',
          'Custom clinic page',
          'Dedicated account manager',
          'Priority customer support',
          'Multi-location support',
          'Patient follow-up automation',
          'Featured Doctor badge',
        ],
      },
    };

    // Calculate bookings used this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // Import Appointment model
    const Appointment = (await import("@/models/Appointment")).default;
    const bookingsThisMonth = await Appointment.countDocuments({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfMonth, $lt: endOfMonth },
      status: { $in: ['confirmed', 'completed', 'pending'] },
    });

    const currentPlan = doctor.plan?.type || 'free';
    const planLimit = planLimits[currentPlan]?.bookingsPerMonth || 10;
    const bookingsRemaining = planLimit === Infinity ? Infinity : Math.max(0, planLimit - bookingsThisMonth);

    // Check if subscription is expiring soon (within 7 days)
    let expiresSoon = false;
    let daysUntilExpiry = 0;
    if (currentSubscription?.endDate) {
      const now = new Date();
      const endDate = new Date(currentSubscription.endDate);
      daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      expiresSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        currentPlan,
        planLimits: planLimits[currentPlan],
        bookingsThisMonth,
        bookingsRemaining: bookingsRemaining === Infinity ? 'Unlimited' : bookingsRemaining,
        planLimit: planLimit === Infinity ? 'Unlimited' : planLimit,
        subscription: currentSubscription ? {
          id: currentSubscription._id,
          plan: currentSubscription.plan,
          billingCycle: currentSubscription.billingCycle,
          startDate: currentSubscription.startDate,
          endDate: currentSubscription.endDate,
          status: currentSubscription.status,
          expiresSoon,
          daysUntilExpiry,
        } : null,
        upcomingSubscription: upcomingSubscription || null,
        paymentHistory: paymentHistory.map(p => ({
          id: p._id,
          plan: p.subscriptionId?.plan || 'Unknown',
          amount: p.amount,
          date: p.createdAt,
          status: p.status,
        })),
        pricing: {
          monthly: {
            pro: 999,
            premium: 2499,
          },
          annual: {
            pro: Math.floor(999 * 0.8),
            premium: Math.floor(2499 * 0.8),
          },
        },
      },
    });

  } catch (error) {
    console.error("Plans error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plans data" },
      { status: 500 }
    );
  }
}