// models/Appointment.js - Clean version without middleware
import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
      index: true,
    },
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
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, "Patient phone is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    patientAge: {
      type: Number,
      required: [true, "Patient age is required"],
      min: [0, "Age cannot be negative"],
      max: [150, "Age cannot exceed 150"],
    },
    condition: {
      type: String,
      trim: true,
      maxlength: [500, "Condition cannot exceed 500 characters"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
      match: [/^([0-9]{1,2}):([0-9]{2})\s?(AM|PM)$/i, "Please enter a valid time format (e.g., 4:30 PM)"],
    },
    type: {
      type: String,
      enum: ["in-person", "video"],
      required: [true, "Appointment type is required"],
      default: "in-person",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
      index: true,
    },
    doctorNote: {
      type: String,
      trim: true,
      maxlength: [2000, "Doctor note cannot exceed 2000 characters"],
    },
    fee: {
      type: Number,
      min: [0, "Fee cannot be negative"],
      required: [true, "Fee is required"],
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },
    cancelledBy: {
      type: String,
      enum: ["patient", "doctor", "system"],
    },
    cancelledAt: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
    },
    videoMeetingUrl: {
      type: String,
      trim: true,
    },
    videoMeetingId: {
      type: String,
      trim: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    isRescheduled: {
      type: Boolean,
      default: false,
    },
    previousAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
AppointmentSchema.index({ patientFamilyId: 1, appointmentDate: 1 });
AppointmentSchema.index({ patientMemberId: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctorId: 1, status: 1 });
AppointmentSchema.index({ appointmentDate: 1, timeSlot: 1 });

AppointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, timeSlot: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ["pending", "confirmed"] } 
    },
    name: "unique_booking_slot"
  }
);

// ── Virtual fields ──────────────────────────────────────────────
AppointmentSchema.virtual("statusLabel").get(function() {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    "no-show": "No Show",
  };
  return labels[this.status] || this.status;
});

AppointmentSchema.virtual("typeLabel").get(function() {
  const labels = {
    "in-person": "In-Person",
    video: "Video Consultation",
  };
  return labels[this.type] || this.type;
});

AppointmentSchema.virtual("formattedDate").get(function() {
  return this.appointmentDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

AppointmentSchema.virtual("formattedTime").get(function() {
  return this.timeSlot;
});

// ── NO MIDDLEWARE ──────────────────────────────────────────────

// ── Instance methods ──────────────────────────────────────────
AppointmentSchema.methods.confirm = async function() {
  this.status = "confirmed";
  return this.save();
};

AppointmentSchema.methods.complete = async function(doctorNote) {
  this.status = "completed";
  if (doctorNote) {
    this.doctorNote = doctorNote;
  }
  return this.save();
};

AppointmentSchema.methods.cancel = async function(reason, cancelledBy = "patient") {
  this.status = "cancelled";
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

// ── Static methods ────────────────────────────────────────────
AppointmentSchema.statics.getDoctorAppointments = async function(doctorId, date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return this.find({
    doctorId,
    appointmentDate: { $gte: startDate, $lte: endDate },
    status: { $in: ["pending", "confirmed"] },
  })
  .sort({ timeSlot: 1 })
  .populate("patientMemberId", "name relationship avatarColor")
  .lean();
};

AppointmentSchema.statics.getPatientUpcoming = async function(patientMemberId, limit = 10) {
  const now = new Date();
  
  return this.find({
    patientMemberId,
    appointmentDate: { $gte: now },
    status: { $in: ["pending", "confirmed"] },
  })
  .sort({ appointmentDate: 1, timeSlot: 1 })
  .limit(limit)
  .populate("doctorId", "name specialty hospital avatarColor")
  .lean();
};

AppointmentSchema.statics.getPatientHistory = async function(patientMemberId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [appointments, total] = await Promise.all([
    this.find({
      patientMemberId,
      status: { $in: ["completed", "cancelled", "no-show"] },
    })
    .sort({ appointmentDate: -1 })
    .skip(skip)
    .limit(limit)
    .populate("doctorId", "name specialty hospital avatarColor")
    .lean(),
    this.countDocuments({
      patientMemberId,
      status: { $in: ["completed", "cancelled", "no-show"] },
    }),
  ]);

  return {
    appointments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

AppointmentSchema.statics.getDoctorStats = async function(doctorId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        doctorId: doctorId,
        appointmentDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

AppointmentSchema.statics.getAvailableSlots = async function(doctorId, date, existingSlots = []) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const bookedSlots = await this.find({
    doctorId,
    appointmentDate: { $gte: startDate, $lte: endDate },
    status: { $in: ["pending", "confirmed"] },
  })
  .select("timeSlot")
  .lean();

  const bookedSlotTimes = new Set(bookedSlots.map(s => s.timeSlot));
  return existingSlots.filter(slot => !bookedSlotTimes.has(slot));
};

// ── Check if model exists before creating it ──────────────────
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);

export default Appointment;