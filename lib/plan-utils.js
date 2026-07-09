// lib/plan-utils.js
import Doctor from "@/models/Doctor";
import Appointment from "@/models/Appointment";
import { connectToDatabase } from "@/lib/db";

export const PLAN_LIMITS = {
  free: {
    bookingsPerMonth: 10,
    maxPatients: 50,
    features: [
      'Basic profile listing',
      'Up to 10 bookings / month',
      'Patient reviews & ratings',
      'Standard search placement'
    ]
  },
  pro: {
    bookingsPerMonth: 100,
    maxPatients: 500,
    features: [
      'Everything in Free',
      'Up to 100 bookings / month',
      'Priority search placement',
      'Verified badge boost',
      'Basic analytics dashboard',
      'WhatsApp appointment reminders',
      'Video consultation support'
    ]
  },
  premium: {
    bookingsPerMonth: Infinity,
    maxPatients: Infinity,
    features: [
      'Everything in Pro',
      'Unlimited bookings',
      'Top placement — disease searches',
      'Advanced analytics',
      'Custom clinic page',
      'Dedicated account manager',
      'Priority customer support',
      'Multi-location support',
      'Patient follow-up automation',
      'Featured Doctor badge'
    ]
  }
};

export const PLAN_PRICES = {
  monthly: {
    pro: 999,
    premium: 2499
  },
  annual: {
    pro: 799, // 20% off
    premium: 1999 // 20% off
  }
};

export async function checkPlanLimit(doctorId) {
  try {
    await connectToDatabase();
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return { 
        allowed: false, 
        error: "Doctor not found",
        plan: 'free',
        used: 0,
        limit: 10,
        remaining: 10,
        isUnlimited: false,
        hasReachedLimit: false
      };
    }

    const plan = doctor.plan?.type || 'free';
    const limit = PLAN_LIMITS[plan]?.bookingsPerMonth || 10;
    
    // Count appointments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const bookingsThisMonth = await Appointment.countDocuments({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfMonth, $lt: endOfMonth },
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    const hasReachedLimit = limit !== Infinity && bookingsThisMonth >= limit;
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - bookingsThisMonth);

    return {
      allowed: !hasReachedLimit,
      limit,
      used: bookingsThisMonth,
      remaining,
      plan,
      isUnlimited: limit === Infinity,
      hasReachedLimit,
      doctor
    };
  } catch (error) {
    console.error('Error checking plan limit:', error);
    return { 
      allowed: false, 
      error: "Failed to check plan limits",
      plan: 'free',
      used: 0,
      limit: 10,
      remaining: 10,
      isUnlimited: false,
      hasReachedLimit: false
    };
  }
}

export function getPlanFeatures(plan) {
  return PLAN_LIMITS[plan]?.features || PLAN_LIMITS.free.features;
}

export function getPlanLimit(plan) {
  return PLAN_LIMITS[plan]?.bookingsPerMonth || 10;
}

export function getPlanPrice(plan, billingCycle = 'monthly') {
  return PLAN_PRICES[billingCycle]?.[plan] || 0;
}