import mongoose from "mongoose";

const HealthRecordSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family ID is required"],
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: [true, "Member ID is required"],
    },
    documentName: {
      type: String,
      required: [true, "Document name is required"],
      trim: true,
    },
    documentType: {
      type: String,
      enum: ["lab_report", "prescription", "xray_scan", "vaccination", "insurance", "other"],
      required: [true, "Document type is required"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    filePublicId: {
      type: String,
      required: [true, "File public ID is required"],
    },
    fileSizeKB: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    documentDate: {
      type: Date,
      default: Date.now,
    },
    doctorName: {
      type: String,
    },
    hospitalName: {
      type: String,
    },
    notes: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploaded by is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

HealthRecordSchema.index({ familyId: 1 });
HealthRecordSchema.index({ memberId: 1 });
HealthRecordSchema.index({ documentType: 1 });
HealthRecordSchema.index({ documentDate: -1 });

export default mongoose.models.HealthRecord || mongoose.model("HealthRecord", HealthRecordSchema);