// Auth Routes
import express from "express";
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/2fa/verify-login", authController.verifyTwoFactorLogin);
router.post("/register", authController.register);
router.post("/otp/request", authController.requestOTP);
router.post("/otp/verify", authController.verifyOTP);
router.post("/refresh", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);

// Password Reset Workflow
import { authorize } from "../middleware/authorize.middleware.js";

const protect = authMiddleware;
router.post("/2fa/setup", protect, authController.setupTwoFactor);
router.post("/2fa/confirm", protect, authController.confirmTwoFactor);
router.post("/request-reset", authController.requestPasswordReset);
router.get(
  "/pending-resets",
  protect,
  authorize(["super_admin"]),
  authController.getPendingResets
);
router.put(
  "/pending-resets/:id/approve",
  protect,
  authorize(["super_admin"]),
  authController.approvePasswordReset
);
router.put(
  "/pending-resets/:id/reject",
  protect,
  authorize(["super_admin"]),
  authController.rejectPasswordReset
);

export default router;
