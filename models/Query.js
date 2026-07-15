import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
  },
  type: {
    type: String,
  },
  publicId: {
    type: String,
  },
});

// models/Query.js - Simplified ConversationMessageSchema
const ConversationMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["doctor", "admin", "patient"],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  attachments: [AttachmentSchema],
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const QuerySchema = new mongoose.Schema(
  {
    // ─── Creator Information (who raised the query) ───
    createdBy: {
      type: String,
      enum: ["doctor", "patient"],
      required: true,
      index: true,
    },

    // ─── Doctor Fields (for doctor queries) ───
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      index: true,
    },
    doctorName: {
      type: String,
      trim: true,
    },
    doctorEmail: {
      type: String,
      trim: true,
    },
    doctorSpecialty: {
      type: String,
      trim: true,
    },
    doctorPhone: {
      type: String,
      trim: true,
    },

    // ─── Patient Fields (for patient queries) ───
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Patients are in User model
      index: true,
    },
    patientName: {
      type: String,
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },

    // ─── Query Content ───
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      enum: [
        "technical",
        "billing",
        "account",
        "feature_request",
        "verification",
        "patient_care",
        "general"
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },

    attachments: [AttachmentSchema],

    adminReply: {
      message: {
        type: String,
        trim: true,
      },
      repliedAt: {
        type: Date,
      },
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    conversation: [ConversationMessageSchema],

    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    closedBy: {
      type: String,
      enum: ["doctor", "patient", "admin", "system"],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───
QuerySchema.index({ doctorId: 1, status: 1 });
QuerySchema.index({ patientId: 1, status: 1 });
QuerySchema.index({ createdBy: 1, status: 1 });
QuerySchema.index({ createdAt: -1 });
QuerySchema.index({ status: 1, priority: 1 });

// ─── Virtual for age ───
QuerySchema.virtual("age").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return this.createdAt.toLocaleDateString();
});

// ─── Virtual for sender info ───
QuerySchema.virtual("senderName").get(function () {
  if (this.createdBy === "doctor") return this.doctorName;
  if (this.createdBy === "patient") return this.patientName;
  return "Unknown";
});

QuerySchema.virtual("senderEmail").get(function () {
  if (this.createdBy === "doctor") return this.doctorEmail;
  if (this.createdBy === "patient") return this.patientEmail;
  return null;
});

QuerySchema.virtual("senderId").get(function () {
  if (this.createdBy === "doctor") return this.doctorId;
  if (this.createdBy === "patient") return this.patientId;
  return null;
});

QuerySchema.virtual("senderRole").get(function () {
  return this.createdBy;
});

// ─── Instance method to get sender info ───
QuerySchema.methods.getSenderInfo = function () {
  return {
    id: this.senderId,
    name: this.senderName,
    email: this.senderEmail,
    role: this.createdBy,
  };
};

// ─── Static method to find queries by user ───
QuerySchema.statics.findByUser = function (userId, role) {
  const filter = {};
  if (role === "doctor") {
    filter.doctorId = userId;
  } else if (role === "patient") {
    filter.patientId = userId;
  }
  return this.find(filter).sort({ createdAt: -1 });
};

// ─── Static method to get user's query stats ───
QuerySchema.statics.getUserStats = async function (userId, role) {
  const filter = {};
  if (role === "doctor") {
    filter.doctorId = userId;
  } else if (role === "patient") {
    filter.patientId = userId;
  }

  const stats = await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// ─── Pre-save middleware to validate required fields ───
QuerySchema.pre('save', function (next) {
  if (this.createdBy === 'doctor') {
    if (!this.doctorId || !this.doctorName || !this.doctorEmail) {
      next(new Error('Doctor information is required for doctor queries'));
    }
  } else if (this.createdBy === 'patient') {
    if (!this.patientId || !this.patientName || !this.patientEmail) {
      next(new Error('Patient information is required for patient queries'));
    }
  }
  next();
});

export default mongoose.models.Query || mongoose.model("Query", QuerySchema);