// models/Doctor.js
import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    specialty: {
      type: String,
      required: [true, "Specialty is required"],
      trim: true,
    },
    medicalRegNo: {
      type: String,
      required: [true, "Medical registration number is required"],
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    hospital: {
      type: String,
      trim: true,
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
    // Keep the old city field for backward compatibility
    city: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    videoConsultFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    about: {
      type: String,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    conditions: {
      type: [String],
      default: [],
    },
    education: {
      type: [String],
      default: [],
    },
    awards: {
      type: [String],
      default: [],
    },
    appointmentSlots: {
      type: [String],
      default: [],
    },
    avatarColor: {
      type: String,
      default: "#6B7280",
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    adminNote: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    plan: {
      type: {
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
      },
      billingCycle: {
        type: String,
        enum: ["monthly", "annual"],
      },
      expiresAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────
DoctorSchema.index({ email: 1 });
DoctorSchema.index({ specialty: 1 });
DoctorSchema.index({ city: 1 });
DoctorSchema.index({ status: 1 });
DoctorSchema.index({ isVerified: 1 });
DoctorSchema.index({ "address.city": 1 });
DoctorSchema.index({ "address.state": 1 });
DoctorSchema.index({ "address.district": 1 });

// ── Virtual for full address ──────────────────────────────────
DoctorSchema.virtual("fullAddress").get(function() {
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

// ── Virtual for formatted location ────────────────────────────
DoctorSchema.virtual("locationDisplay").get(function() {
  const parts = [];
  if (this.address?.city) parts.push(this.address.city);
  if (this.address?.state) parts.push(this.address.state);
  return parts.join(", ") || this.city || "Location not specified";
});

// ── Method to get address as object ────────────────────────────
DoctorSchema.methods.getAddress = function() {
  return {
    street: this.address?.street || "",
    area: this.address?.area || "",
    landmark: this.address?.landmark || "",
    city: this.address?.city || this.city || "",
    district: this.address?.district || "",
    state: this.address?.state || "",
    pincode: this.address?.pincode || "",
    country: this.address?.country || "India",
    full: this.fullAddress,
  };
};

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);