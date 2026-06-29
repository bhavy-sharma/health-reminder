import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "patient",
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    resetToken: {
      token: { type: String },
      expiresAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model recompilation during hot-reloads
export default mongoose.models.User || mongoose.model("User", UserSchema);
