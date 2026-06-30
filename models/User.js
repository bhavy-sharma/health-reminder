import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "patient",
      enum: ["patient", "doctor", "admin"],
    },
    activeFamilyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
    },
    families: [
      {
        familyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Family",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    resetToken: {
      token: { type: String },
      expiresAt: { type: Date },
    },
    profile: {
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      },
      avatarColor: {
        type: String,
        default: "#6B7280",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ mobile: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ "families.familyId": 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);