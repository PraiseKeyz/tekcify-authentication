import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";
import {
  createUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  verifyMfaCode,
  updateUser,
  deleteUser,
} from "../controller/auth.controller";

const router = Router();

//  Public Authentication
router.post("/sign-up", createUser);
router.post("/sign-in", loginUser);

//  Email Verification & MFA
router.post("/verify-email", verifyEmail);
router.post("/verify-mfacode", verifyMfaCode);

//  Password Reset
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

//  User Profile (Authenticated)
router.get("/me", authenticate, getUserProfile);
router.put("/me", authenticate, updateUser);

//  User Management (Authenticated/Admin)
router.get("/users", authenticate, authorizeRoles("AdminRole"), getAllUsers);
router.delete("/users/:id", authenticate, deleteUser);

export default router;
