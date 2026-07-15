import mongoose from "mongoose";

const ShareSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FamilyMember",
    required: true,
  },
  patient: {
    name: String,
    age: String,
    gender: String,
    bloodGroup: String,
    allergies: [String],
  },
  doctor: {
    name: String,
    specialty: String,
    hospital: String,
    city: String,
    consultationFee: Number,
  },
  visit: {
    date: String,
    time: String,
    reason: String,
  },
  generatedAt: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Share || mongoose.model("Share", ShareSchema);