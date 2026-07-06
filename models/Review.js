// models/Review.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
      index: true,
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family ID is required"],
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: [true, "Member ID is required"],
      index: true,
    },
    authorName: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Review text cannot exceed 2000 characters"],
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, "Helpful count cannot be negative"],
    },
    helpfulBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    doctorReply: {
      type: String,
      trim: true,
      maxlength: [1000, "Doctor reply cannot exceed 1000 characters"],
    },
    doctorRepliedAt: {
      type: Date,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────
ReviewSchema.index({ doctorId: 1, createdAt: -1 });
ReviewSchema.index({ familyId: 1 });
ReviewSchema.index({ memberId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isFlagged: 1 });
ReviewSchema.index({ helpfulCount: -1 });

// ── NO MIDDLEWARE ──────────────────────────────────────────────
// Removed all pre-save middleware to avoid "next is not a function" errors

// ── Compound index ─────────────────────────────────────────────
ReviewSchema.index({ doctorId: 1, memberId: 1 }, { unique: true });

// ── Check if model exists before creating it ──────────────────
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;