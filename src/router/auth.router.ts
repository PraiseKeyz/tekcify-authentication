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
} from "../controller/auth.controller";

const router = Router();

router.post("/sign-up", createUser);
router.post("/sign-in", loginUser);

router.get("/me", authenticate, getUserProfile);

router.get("/users", authenticate, authorizeRoles("AdminRole"), getAllUsers);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/verify-mfacode", verifyMfaCode);
export default router;
