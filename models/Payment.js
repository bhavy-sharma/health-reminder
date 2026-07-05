import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    // Reference to the appointment
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment ID is required"],
      index: true,
    },
    
    // Doctor receiving payment
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
      index: true,
    },
    
    // Patient making payment
    patientFamilyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Patient family ID is required"],
      index: true,
    },
    
    patientMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: [true, "Patient member ID is required"],
      index: true,
    },

    // Payment details
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      enum: ["INR", "USD", "EUR"],
    },

    // Payment status
    status: {
      type: String,
      enum: {
        values: ["pending", "initiated", "completed", "failed", "refunded", "partially_refunded"],
        message: "Invalid payment status",
      },
      default: "pending",
      index: true,
    },

    // Payment method
    method: {
      type: String,
      enum: {
        values: ["razorpay", "stripe", "paypal", "bank_transfer", "cash", "insurance", "wallet"],
        message: "Invalid payment method",
      },
      required: [true, "Payment method is required"],
    },

    // Payment gateway details
    gateway: {
      paymentId: {
        type: String,
        trim: true,
        index: true,
      },
      orderId: {
        type: String,
        trim: true,
        index: true,
      },
      signature: {
        type: String,
        trim: true,
      },
      transactionId: {
        type: String,
        trim: true,
        index: true,
      },
      paymentLink: {
        type: String,
        trim: true,
      },
    },

    // Customer details
    customer: {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
      },
      phone: {
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
      },
    },

    // Billing information
    billingDetails: {
      address: {
        type: String,
        trim: true,
      },
      city: {
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
        match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],
      },
      country: {
        type: String,
        default: "India",
      },
      gstin: {
        type: String,
        trim: true,
        uppercase: true,
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Please enter a valid GSTIN"],
      },
    },

    // Payment breakdown
    breakdown: {
      consultationFee: {
        type: Number,
        min: 0,
      },
      platformFee: {
        type: Number,
        min: 0,
        default: 0,
      },
      tax: {
        type: Number,
        min: 0,
        default: 0,
      },
      discount: {
        type: Number,
        min: 0,
        default: 0,
      },
      couponCode: {
        type: String,
        trim: true,
        uppercase: true,
      },
      couponDiscount: {
        type: Number,
        min: 0,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // Refund details
    refund: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      reason: {
        type: String,
        trim: true,
        maxlength: [500, "Refund reason cannot exceed 500 characters"],
      },
      initiatedAt: {
        type: Date,
      },
      completedAt: {
        type: Date,
      },
      gatewayRefundId: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
      },
    },

    // Subscription related (if applicable)
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },

    // Invoice details
    invoice: {
      number: {
        type: String,
        trim: true,
        index: true,
      },
      url: {
        type: String,
        trim: true,
      },
      generatedAt: {
        type: Date,
      },
      sentToCustomer: {
        type: Boolean,
        default: false,
      },
    },

    // Payment metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Failure details
    failure: {
      code: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      reason: {
        type: String,
        trim: true,
      },
      source: {
        type: String,
        trim: true,
      },
    },

    // Timestamps for payment lifecycle
    initiatedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },

    // Tracking
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },

    // Webhook tracking
    webhookReceived: {
      type: Boolean,
      default: false,
    },
    webhookReceivedAt: {
      type: Date,
    },
    webhookPayload: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Additional flags
    isTest: {
      type: Boolean,
      default: false,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    isFraudulent: {
      type: Boolean,
      default: false,
    },
    
    // Admin notes
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, "Admin notes cannot exceed 2000 characters"],
    },

    // Payment attempts
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
PaymentSchema.index({ "gateway.paymentId": 1 }, { sparse: true });
PaymentSchema.index({ "gateway.orderId": 1 }, { sparse: true });
PaymentSchema.index({ "gateway.transactionId": 1 }, { sparse: true });
PaymentSchema.index({ doctorId: 1, status: 1 });
PaymentSchema.index({ patientFamilyId: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ "invoice.number": 1 }, { sparse: true });
PaymentSchema.index({ amount: 1 });

// Compound index for subscription payments
PaymentSchema.index({ subscriptionId: 1, status: 1 });

// Virtual field for amount in words
PaymentSchema.virtual("amountInWords").get(function() {
  return numberToWords(this.amount);
});

// Virtual field for payment status label
PaymentSchema.virtual("statusLabel").get(function() {
  const labels = {
    pending: "Pending",
    initiated: "Initiated",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
    partially_refunded: "Partially Refunded",
  };
  return labels[this.status] || this.status;
});

// Virtual field for method label
PaymentSchema.virtual("methodLabel").get(function() {
  const labels = {
    razorpay: "Razorpay",
    stripe: "Stripe",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    insurance: "Insurance",
    wallet: "Wallet",
  };
  return labels[this.method] || this.method;
});

// Pre-save middleware
PaymentSchema.pre("save", function(next) {
  // Calculate total if not provided
  if (!this.breakdown.total && this.amount) {
    this.breakdown.total = this.amount;
  }

  // Set initiatedAt when status changes to initiated
  if (this.isModified("status") && this.status === "initiated" && !this.initiatedAt) {
    this.initiatedAt = new Date();
  }

  // Set completedAt when status changes to completed
  if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
  }

  // Set failedAt when status changes to failed
  if (this.isModified("status") && this.status === "failed" && !this.failedAt) {
    this.failedAt = new Date();
  }

  // Generate invoice number if not exists and payment is completed
  if (this.status === "completed" && !this.invoice.number) {
    this.invoice.number = generateInvoiceNumber();
    this.invoice.generatedAt = new Date();
  }

  next();
});

// Instance methods
PaymentSchema.methods.markAsCompleted = async function(transactionDetails = {}) {
  this.status = "completed";
  this.completedAt = new Date();
  
  if (transactionDetails.paymentId) {
    this.gateway.paymentId = transactionDetails.paymentId;
  }
  if (transactionDetails.transactionId) {
    this.gateway.transactionId = transactionDetails.transactionId;
  }
  if (transactionDetails.signature) {
    this.gateway.signature = transactionDetails.signature;
  }
  
  return this.save();
};

PaymentSchema.methods.markAsFailed = async function(failureDetails = {}) {
  this.status = "failed";
  this.failedAt = new Date();
  this.attempts += 1;
  
  if (failureDetails.code) {
    this.failure.code = failureDetails.code;
  }
  if (failureDetails.description) {
    this.failure.description = failureDetails.description;
  }
  if (failureDetails.reason) {
    this.failure.reason = failureDetails.reason;
  }
  
  return this.save();
};

PaymentSchema.methods.initiateRefund = async function(amount, reason) {
  if (this.status !== "completed") {
    throw new Error("Only completed payments can be refunded");
  }
  
  if (amount > this.amount) {
    throw new Error("Refund amount cannot exceed payment amount");
  }
  
  this.refund.amount = amount;
  this.refund.reason = reason;
  this.refund.initiatedAt = new Date();
  this.refund.status = "pending";
  
  // Update payment status
  if (amount === this.amount) {
    this.status = "refunded";
  } else {
    this.status = "partially_refunded";
  }
  
  return this.save();
};

PaymentSchema.methods.completeRefund = async function(gatewayRefundId) {
  if (this.refund.status !== "pending") {
    throw new Error("Refund is not in pending state");
  }
  
  this.refund.status = "completed";
  this.refund.completedAt = new Date();
  this.refund.gatewayRefundId = gatewayRefundId;
  
  return this.save();
};

PaymentSchema.methods.retry = async function() {
  if (this.status !== "failed") {
    throw new Error("Only failed payments can be retried");
  }
  
  if (this.attempts >= this.maxAttempts) {
    throw new Error("Maximum retry attempts reached");
  }
  
  this.status = "pending";
  this.failedAt = null;
  this.failure = {};
  
  return this.save();
};

// Static methods
PaymentSchema.statics.getDoctorEarnings = async function(doctorId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        doctorId: doctorId,
        status: "completed",
        completedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalPlatformFee: { $sum: "$breakdown.platformFee" },
        totalTax: { $sum: "$breakdown.tax" },
        totalDiscount: { $sum: "$breakdown.discount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0] : {
    totalAmount: 0,
    totalPlatformFee: 0,
    totalTax: 0,
    totalDiscount: 0,
    count: 0,
  };
};

PaymentSchema.statics.getPlatformRevenue = async function(startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        status: "completed",
        completedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalPlatformFees: { $sum: "$breakdown.platformFee" },
        totalTax: { $sum: "$breakdown.tax" },
        totalDiscounts: { $sum: "$breakdown.discount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalPlatformFees: 1,
        totalTax: 1,
        totalDiscounts: 1,
        count: 1,
        netRevenue: {
          $subtract: [
            "$totalRevenue",
            { $add: ["$totalPlatformFees", "$totalTax"] },
          ],
        },
      },
    },
  ]);

  return result.length > 0 ? result[0] : {
    totalRevenue: 0,
    totalPlatformFees: 0,
    totalTax: 0,
    totalDiscounts: 0,
    count: 0,
    netRevenue: 0,
  };
};

PaymentSchema.statics.getPaymentStats = async function(doctorId) {
  const stats = await this.aggregate([
    {
      $match: {
        doctorId: doctorId,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const result = {
    total: 0,
    completed: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
  };

  stats.forEach((stat) => {
    const status = stat._id;
    result[status] = {
      count: stat.count,
      amount: stat.totalAmount,
    };
    result.total += stat.count;
  });

  return result;
};

// Helper function to generate invoice number
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${year}${month}${day}-${random}`;
}

// Helper function to convert number to words (simplified)
function numberToWords(num) {
  // Simple implementation - you can use a library for this
  if (num === 0) return "Zero";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
  
  return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "");
}

// Check if model exists before creating it
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;