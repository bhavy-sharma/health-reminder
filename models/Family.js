import mongoose from "mongoose";

const FamilySchema = new mongoose.Schema(
  {
    familyName: {
      type: String,
      required: [true, "Family name is required"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FamilyMember",
      },
    ],
    plan: {
      type: String,
      enum: ["free", "basic", "premium", "family"],
      default: "free",
    },
    planExpiry: {
      type: Date,
    },
    storageUsed: {
      type: Number,
      default: 0, // in GB
    },
    storageLimit: {
      type: Number,
      default: 5, // in GB
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      shareHealthData: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster queries
FamilySchema.index({ createdBy: 1 });
FamilySchema.index({ familyName: 1 });
FamilySchema.index({ isActive: 1 });

// Check if model exists before creating it
const Family = mongoose.models.Family || mongoose.model("Family", FamilySchema);

export default Family;