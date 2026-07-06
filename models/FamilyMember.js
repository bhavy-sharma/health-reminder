import mongoose from "mongoose";

const FamilyMemberSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    relationship: {
      type: String,
      enum: ["self", "spouse", "father", "mother", "son", "daughter", "grandfather", "grandmother", "other"],
      required: [true, "Relationship is required"],
      default: "self",
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      default: () => new Date("2000-01-01"),
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
      default: "other",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    avatarColor: {
      type: String,
      default: "#6B7280",
    },
    avatarUrl: {
      type: String,
    },
    knownConditions: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        prescribedBy: String,
        notes: String,
      },
    ],
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
FamilyMemberSchema.index({ familyId: 1 });
FamilyMemberSchema.index({ userId: 1 });
FamilyMemberSchema.index({ isPrimary: 1 });

// Middleware to ensure only one primary member
FamilyMemberSchema.pre('save', async function() {
  if (this.isPrimary) {
    try {
      const FamilyMember = mongoose.models.FamilyMember || mongoose.model("FamilyMember", FamilyMemberSchema);
      const existingPrimary = await FamilyMember.findOne({
        familyId: this.familyId,
        isPrimary: true,
        _id: { $ne: this._id }
      });
      
      if (existingPrimary) {
        existingPrimary.isPrimary = false;
        await existingPrimary.save();
      }
    } catch (error) {
      console.error("Error in pre-save middleware:", error);
    }
  }
});

// Check if model exists before creating it
const FamilyMember = mongoose.models.FamilyMember || mongoose.model("FamilyMember", FamilyMemberSchema);

export default FamilyMember;