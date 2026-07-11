// models/User.js
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
      required: [true, "Role is required"],
      default: "patient",
      enum: ["patient", "doctor", "admin"],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      area: {
        type: String,
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      trim: true,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    // ─── Plan & Subscription ───
    plan: {
      type: String,
      enum: ["free", "family", "premium"],
      default: "free",
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "family", "premium"],
      },
      status: {
        type: String,
        enum: ["active", "expired", "cancelled", "pending"],
        default: "pending",
      },
      billingCycle: {
        type: String,
        enum: ["monthly", "annual"],
      },
      startDate: {
        type: Date,
      },
      expiresAt: {
        type: Date,
      },
      paymentId: {
        type: String,
      },
    },
    // ─── Storage (Root level - NOT inside subscription) ───
    storageUsed: {
      type: Number,
      default: 0, // in GB
    },
    storageLimit: {
      type: Number,
      default: 1, // 1 GB for free plan
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────
UserSchema.index({ mobile: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ "families.familyId": 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isSuspended: 1 });
UserSchema.index({ "address.city": 1 });
UserSchema.index({ "address.state": 1 });
UserSchema.index({ "address.district": 1 });
UserSchema.index({ plan: 1 });

// ─── Virtual for full address ──────────────────────────────────
UserSchema.virtual("fullAddress").get(function () {
  const parts = [];
  if (this.address?.street) parts.push(this.address.street);
  if (this.address?.area) parts.push(this.address.area);
  if (this.address?.landmark) parts.push(this.address.landmark);
  if (this.address?.city) parts.push(this.address.city);
  if (this.address?.district) parts.push(this.address.district);
  if (this.address?.state) parts.push(this.address.state);
  if (this.address?.pincode) parts.push(this.address.pincode);
  if (this.address?.country) parts.push(this.address.country);
  return parts.join(", ");
});

// ─── Virtual for formatted location ────────────────────────────
UserSchema.virtual("locationDisplay").get(function () {
  const parts = [];
  if (this.address?.city) parts.push(this.address.city);
  if (this.address?.state) parts.push(this.address.state);
  return parts.join(", ") || "Location not specified";
});

// ─── Virtual: remaining storage ────────────────────────────────
UserSchema.virtual("remainingStorage").get(function () {
  return Math.max(0, this.storageLimit - this.storageUsed);
});

// ─── Virtual: storage percentage ───────────────────────────────
UserSchema.virtual("storagePercentage").get(function () {
  if (this.storageLimit === 0) return 0;
  return Math.min(100, (this.storageUsed / this.storageLimit) * 100);
});

// ─── Virtual: is storage full ──────────────────────────────────
UserSchema.virtual("isStorageFull").get(function () {
  return this.storageUsed >= this.storageLimit;
});

// ─── Method to get address as object ────────────────────────────
UserSchema.methods.getAddress = function () {
  return {
    street: this.address?.street || "",
    area: this.address?.area || "",
    landmark: this.address?.landmark || "",
    city: this.address?.city || "",
    district: this.address?.district || "",
    state: this.address?.state || "",
    pincode: this.address?.pincode || "",
    country: this.address?.country || "India",
    full: this.fullAddress,
  };
};

export default mongoose.models.User || mongoose.model("User", UserSchema);