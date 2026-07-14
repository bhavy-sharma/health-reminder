import mongoose from 'mongoose';

const MedicineReminderSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    medicineType: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Ointment', 'Other'],
      default: 'Tablet',
    },
    dosage: {
      type: String,
      required: true, // e.g. "1 tablet", "5ml"
    },
    foodRelation: {
      type: String,
      enum: ['Before Food', 'After Food', 'With Food', 'No Relation', 'empty_stomach', 'before_food', 'with_food', 'after_food', 'no_relation'],
      default: 'After Food',
    },
    // Scheduling flags
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false },
    empty_stomach: { type: Boolean, default: false },
    after_breakfast: { type: Boolean, default: false },
    after_lunch: { type: Boolean, default: false },
    before_dinner: { type: Boolean, default: false },
    after_dinner: { type: Boolean, default: false },
    before_bed: { type: Boolean, default: false },
    customTime: { type: String }, // e.g. "14:30" or ""
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    reminderTime: { type: String, required: true }, // e.g., "08:00 AM", "08:00 PM", "14:30"
    responseWindowMinutes: { type: Number, default: 10 }, // time to reply before missed
    messageTemplate: { type: String },
    
    repeatType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Custom'],
      default: 'Daily',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MedicineReminder = mongoose.models.MedicineReminder || mongoose.model('MedicineReminder', MedicineReminderSchema);
export default MedicineReminder;