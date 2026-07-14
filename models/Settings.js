import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  homepage: {
    showPlatformHealth: {
      type: Boolean,
      default: false,
    }
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
