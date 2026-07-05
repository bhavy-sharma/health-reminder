import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
      index: true,
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family ID is required"],
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: [true, "Member ID is required"],
      index: true,
    },
    authorName: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Review text cannot exceed 2000 characters"],
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, "Helpful count cannot be negative"],
    },
    helpfulBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    doctorReply: {
      type: String,
      trim: true,
      maxlength: [1000, "Doctor reply cannot exceed 1000 characters"],
    },
    doctorRepliedAt: {
      type: Date,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
ReviewSchema.index({ doctorId: 1, createdAt: -1 });
ReviewSchema.index({ familyId: 1 });
ReviewSchema.index({ memberId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isFlagged: 1 });
ReviewSchema.index({ helpfulCount: -1 });

// Compound index to ensure one review per member per doctor
ReviewSchema.index({ doctorId: 1, memberId: 1 }, { unique: true });

// Pre-save middleware to validate text for ratings
ReviewSchema.pre("save", function(next) {
  // If rating is less than 3, text is required for constructive feedback
  if (this.rating < 3 && (!this.text || this.text.trim().length === 0)) {
    next(new Error("Please provide feedback text for ratings below 3 stars"));
  }
  next();
});

// Pre-save middleware to auto-set doctorRepliedAt
ReviewSchema.pre("save", function(next) {
  if (this.doctorReply && !this.doctorRepliedAt) {
    this.doctorRepliedAt = new Date();
  }
  next();
});

// Instance method to mark as helpful
ReviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpfulBy.includes(userId)) {
    this.helpfulBy.push(userId);
    this.helpfulCount += 1;
    return this.save();
  }
  return this;
};

// Instance method to remove helpful mark
ReviewSchema.methods.unmarkHelpful = async function(userId) {
  const index = this.helpfulBy.indexOf(userId);
  if (index > -1) {
    this.helpfulBy.splice(index, 1);
    this.helpfulCount -= 1;
    return this.save();
  }
  return this;
};

// Instance method to add doctor reply
ReviewSchema.methods.addDoctorReply = async function(reply) {
  this.doctorReply = reply;
  this.doctorRepliedAt = new Date();
  return this.save();
};

// Static method to get average rating for a doctor
ReviewSchema.statics.getAverageRating = async function(doctorId) {
  const result = await this.aggregate([
    { $match: { doctorId: doctorId, isFlagged: false } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  
  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }
  
  return {
    averageRating: Math.round(result[0].avgRating * 10) / 10,
    totalReviews: result[0].count,
  };
};

// Static method to get rating distribution for a doctor
ReviewSchema.statics.getRatingDistribution = async function(doctorId) {
  const result = await this.aggregate([
    { $match: { doctorId: doctorId, isFlagged: false } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  
  result.forEach((item) => {
    distribution[item._id] = item.count;
  });
  
  return distribution;
};

// Static method to get recent reviews for a doctor
ReviewSchema.statics.getRecentReviews = async function(doctorId, limit = 10) {
  return this.find({ doctorId, isFlagged: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("memberId", "name relationship avatarColor")
    .lean();
};

// Static method to get reviews by rating
ReviewSchema.statics.getReviewsByRating = async function(doctorId, rating) {
  return this.find({ 
    doctorId, 
    rating, 
    isFlagged: false 
  })
  .sort({ createdAt: -1 })
  .populate("memberId", "name relationship avatarColor")
  .lean();
};

// Static method to flag inappropriate reviews
ReviewSchema.statics.flagReview = async function(reviewId) {
  const review = await this.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  review.isFlagged = true;
  await review.save();
  return review;
};

// Static method to unflag review
ReviewSchema.statics.unflagReview = async function(reviewId) {
  const review = await this.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  review.isFlagged = false;
  await review.save();
  return review;
};

// Virtual for review age in days
ReviewSchema.virtual("ageInDays").get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Check if model exists before creating it
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;