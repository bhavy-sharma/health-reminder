// models/Subscription.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ doctorId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ endDate: 1 });

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);