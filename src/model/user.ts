import mongoose from "mongoose";
import { IUser } from "../interface/user.interface";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["UserRole", "AdminRole"],
      default: "UserRole",
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    mfaCode: {
      type: String,
    },
    mfaCodeExpires: {
      type: Date,
    },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
