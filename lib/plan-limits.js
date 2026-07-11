// lib/plan-limits.js
export const PLAN_LIMITS = {
  free: {
    storageLimit: 1, // 1 GB
    maxMembers: 2,
    maxBookings: 10,
    features: [
      "2 family members",
      "1 GB storage",
      "WhatsApp reminders",
      "Basic records",
    ],
  },
  family: {
    storageLimit: 5, // 5 GB
    maxMembers: Infinity,
    maxBookings: 100,
    features: [
      "Unlimited members",
      "5 GB storage",
      "WhatsApp reminders",
      "Doctor PDF sharing",
      "Priority support",
    ],
  },
  premium: {
    storageLimit: 20, // 20 GB
    maxMembers: Infinity,
    maxBookings: Infinity,
    features: [
      "Everything in Family",
      "20 GB storage",
      "AI health insights",
      "ABHA integration",
      "Dedicated support",
    ],
  },
};

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function getStorageLimit(plan) {
  return getPlanLimits(plan).storageLimit;
}

export function getMaxMembers(plan) {
  return getPlanLimits(plan).maxMembers;
}

export function getMaxBookings(plan) {
  return getPlanLimits(plan).maxBookings;
}

export function hasStorageSpace(user, fileSizeInBytes) {
  const fileSizeInGB = fileSizeInBytes / (1024 * 1024 * 1024);
  const remaining = user.storageLimit - user.storageUsed;
  return remaining >= fileSizeInGB;
}