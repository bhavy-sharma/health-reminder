import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String }, // null if Google-only account
    googleId: { type: String }, // from Google OAuth
    authProvider: { type: String, enum: ["email", "google"], default: "email" },
    role: { type: String, default: "doctor" },
    specialty: { type: String },
    tagline: { type: String },
    hospital: { type: String },
    address: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    consultationFee: { type: Number },
    videoConsultFee: { type: Number },
    experience: { type: Number },
    medicalRegNo: { type: String },
    isVerified: { type: Boolean, default: false },
    about: { type: String },
    languages: [{ type: String }],
    conditions: [{ type: String }],
    education: [{ type: String }],
    awards: [{ type: String }],
    appointmentSlots: [{ type: String }], // ["10:00 AM", "4:30 PM"]
    avatarColor: { type: String },
    plan: {
      type: {
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
      },
      billingCycle: { type: String, enum: ["monthly", "annual"] },
      expiresAt: { type: Date },
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
