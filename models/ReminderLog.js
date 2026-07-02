import mongoose from 'mongoose';

const ReminderLogSchema = new mongoose.Schema(
  {
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineReminder',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    medicineName: { type: String, required: true },
    dosage: { type: String },
    scheduledTime: { type: Date, required: true }, // Exact date & time this was scheduled to run
    status: {
      type: String,
      enum: ['Sent', 'Taken', 'Missed', 'Skipped', 'Failed'],
      default: 'Sent',
    },
    takenAt: { type: Date },
    messageSid: { type: String }, // Twilio API response ref if needed
  },
  { timestamps: true }
);

const ReminderLog = mongoose.models.ReminderLog || mongoose.model('ReminderLog', ReminderLogSchema);
export default ReminderLog;
