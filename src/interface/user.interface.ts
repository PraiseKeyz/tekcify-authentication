import { ObjectId } from "mongoose";

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role?: "UserRole" | "AdminRole";
  passwordResetToken?: string | null;
  verificationToken?: string | null;
  mfaCode?: string;
  mfaCodeExpires?: Date;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
