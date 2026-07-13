// models/Query.js
import mongoose from "mongoose";

const QuerySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    doctorEmail: {
      type: String,
      required: true,
      trim: true,
    },
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
        "patient",
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
    attachments: [
      {
        name: String,
        url: String,
        size: Number,
        type: String,
      },
    ],
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
    conversation: [
      {
        sender: {
          type: String,
          enum: ["doctor", "admin"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        attachments: [
          {
            name: String,
            url: String,
            size: Number,
            type: String,
          },
        ],
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    closedBy: {
      type: String,
      enum: ["doctor", "admin", "system"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuerySchema.index({ doctorId: 1, status: 1 });
QuerySchema.index({ createdAt: -1 });
QuerySchema.index({ status: 1, priority: 1 });

// Virtual for age
QuerySchema.virtual("age").get(function() {
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

export default mongoose.models.Query || mongoose.model("Query", QuerySchema);