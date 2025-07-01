import { Request, Response } from "express";
import User from "../model/user";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendEmail } from "../utils/emailservice";
import { sendResponse } from "../utils/apiResponse";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../config/logger";

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL;

export const createUser = async (req: Request, res: Response) => {
  const user = new User(req.body);
  if (!user) {
    res.status(400).json({ message: "Missing fields required" });
    return;
  }
  try {
    const { email } = user;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }
    const passwordHash = await argon2.hash(user.password);

    user.password = passwordHash;

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;

    await user.save();

    await sendVerificationEmail(user, verificationToken);

    const { password: _, ...isWithoutPassword } = user.toObject();
    logger.info("User signup completed successfully", { userId: user._id });
    sendResponse({
      res,
      status: 201,
      message: "User created sucessfully",
      data: { user: isWithoutPassword },
    });
  } catch (error) {
    logger.error("Request failed - Internal server error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse({ res, status: 500, error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendResponse({ res, status: 400, error: "Missing fields required" });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login failed - User not found", { email });
      sendResponse({ res, status: 404, error: "User not found" });
      return;
    }
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      logger.warn("Login failed - Invalid password", { email });
      sendResponse({ res, status: 401, error: "Invalid password" });
      return;
    }

    await sendMfaCode(user);
    logger.info("MFA code sent for login", { userId: user._id });
    sendResponse({
      res,
      status: 200,
      message: "MFA code sent to your email. Please verify to complete login.",
    });
    return;
  } catch (error) {
    logger.error("Request failed - Internal server error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse({ res, status: 500, error: "Internal server error" });
    return;
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    sendResponse({
      res,
      message: "All users fetched successfully",
      data: users,
    });
  } catch (error) {
    logger.error("Request failed - Internal server error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse({ res, status: 500, error: "Internal server error" });
  }
};

export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      logger.warn("Request failed - User not found", { userId });
      res.status(404).json({ message: "User not found" });
      return;
    }
    logger.info("User profile fetched successfully", { userId });
    sendResponse({
      res,
      status: 201,
      message: "User signup completed successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Request failed - Internal server error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("Request failed - User not found", { userId });
      sendResponse({ res, status: 404, error: "Invalid credentials" });
      return;
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      logger.warn("Request failed - Email already exists", { email });
      sendResponse({ res, status: 400, error: "Email already exists" });
      return;
    }

    if (password) {
      user.password = await argon2.hash(password);
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    const { password: _, ...isWithoutPassword } = user.toObject();
    logger.info("User profile updated successfully", { userId });

    sendResponse({
      res,
      status: 200,
      message: "User profile Updated successfully",
      data: { user: isWithoutPassword },
    });
  } catch (error) {
    logger.error("Request failed - Internal server error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      logger.warn("Delete user failed - Missing user ID");
      sendResponse({ res, status: 400, error: "User Id is required" });
      return;
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      logger.warn("Request failed - User not found", { userId });
      sendResponse({ res, status: 400, error: "User not found" });
      return;
    }
    logger.info("User profile deleted successfully", { userId });
    sendResponse({
      res,
      status: 200,
      message: "User profile deleted successfully",
    });
  } catch (error) {
    logger.error("Request failed - Internal server error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse({ res, status: 500, error: "Internal server error" });
  }
};

export const sendVerificationEmail = async (
  user: any,
  verificationToken: string,
): Promise<void> => {
  try {
    const verifyUrl = `${frontendUrl}/api/auth/verify-email?token=${verificationToken}`;
    await sendEmail(
      user.email,
      "Verify your email",
      `Click to verify: ${verifyUrl}`,
    );
  } catch (error) {
    logger.error("Failed to send verification email", {
      userId: user?._id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }
    user.verificationToken = null;
    user.isVerified = true;
    await user.save();
    sendResponse({ res, status: 200, message: "Email verified successfully" });
  } catch (error) {
    logger.error("Request failed - Email verification error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    await user.save();
    const resetUrl = `${frontendUrl}/api/auth/reset-password?token=${resetToken}`;
    await sendEmail(
      user.email,
      "Password Reset",
      `Reset your password: ${resetUrl}`,
    );
    sendResponse({ res, status: 200, message: "Password reset email sent" });
  } catch (error) {
    logger.error("Request failed - Password reset error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse({ res, status: 500, error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const { password } = req.body;
    const user = await User.findOne({ passwordResetToken: token });
    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }
    user.password = await argon2.hash(password);
    user.passwordResetToken = undefined;
    await user.save();
    sendResponse({ res, status: 200, message: "Password reset successful" });
  } catch (error) {
    logger.error("Request failed - Password reset error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse({ res, status: 500, error: "Internal server error" });
  }
};

export const sendMfaCode = async (user: any) => {
  try {
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = mfaCode;
    user.mfaCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();
    await sendEmail(user.email, "Your MFA Code", `Your code: ${mfaCode}`);
  } catch (error) {
    logger.error("Request failed - Send MFA code error", {
      userId: user?._id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export const verifyMfaCode = async (req: Request, res: Response) => {
  try {
    const { email, mfaCode } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.mfaCode || !user.mfaCodeExpires) {
      sendResponse({ res, status: 400, error: "MFA not requested or expired" });
      return;
    }
    if (user.mfaCode !== mfaCode || user.mfaCodeExpires < new Date()) {
      sendResponse({ res, status: 400, error: "Invalid or expired MFA code" });
      return;
    }
    user.mfaCode = undefined;
    user.mfaCodeExpires = undefined;
    await user.save();
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" },
    );
    sendResponse({
      res,
      status: 200,
      message: "MFA verified",
      data: { token },
    });
  } catch (error) {
    logger.error("Request failed - Verify MFA code error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse({ res, status: 500, error: "Internal server error" });
  }
};
