// Authentication Controller
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import PasswordReset from "../models/passwordReset.model.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
} from "../config/jwt.js";
import { sanitizeUser, generateRandomPassword } from "../utils/helpers.js";
import smsService from "../utils/smsService.js";
import emailService from "../utils/emailService.js";

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

const getClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.ip;
};

/**
 * Login with email and password
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const lockUntil = user.twoFactorLockUntil ? new Date(user.twoFactorLockUntil) : null;
    if (lockUntil && lockUntil.getTime() > Date.now()) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked due to too many failed 2FA attempts. Please try again later.",
      });
    }

    // If 2FA is enabled, do NOT issue the full session tokens yet
    if (user.twoFactorEnabled) {
      const pendingTwoFactorToken = generateToken({
        userId: user.id,
        role: user.role,
        type: "2fa_pending",
      });

      return res.json({
        success: true,
        message: "Two-factor authentication required",
        data: {
          twoFactorRequired: true,
          pendingTwoFactorToken,
        },
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = getClientIp(req);
    await user.save();

    // Generate tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Return user data without password
    const userData = sanitizeUser(user);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Setup Google Authenticator (TOTP) for the logged-in user
 * Returns QR code data URL (otpauth) and a secret (manual fallback).
 * Does NOT enable 2FA until confirmed.
 */
export const setupTwoFactor = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const serviceName = process.env.TWO_FACTOR_APP_NAME || "ELSY";

    const secret = speakeasy.generateSecret({
      name: `${serviceName} (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    user.twoFactorConfirmedAt = null;
    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = null;
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: "2FA secret generated",
      data: {
        qrCodeDataUrl,
        manualEntryKey: secret.base32,
      },
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to setup 2FA",
      error: error.message,
    });
  }
};

/**
 * Confirm Google Authenticator code to enable 2FA
 */
export const confirmTwoFactor = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA is not initialized for this user",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: String(otp),
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.twoFactorEnabled = true;
    user.twoFactorConfirmedAt = new Date();
    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = null;
    await user.save();

    res.json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("2FA confirm error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm 2FA",
      error: error.message,
    });
  }
};

/**
 * Verify OTP during login and issue JWT
 */
export const verifyTwoFactorLogin = async (req, res) => {
  try {
    const { pendingTwoFactorToken, otp } = req.body;
    if (!pendingTwoFactorToken || !otp) {
      return res.status(400).json({
        success: false,
        message: "pendingTwoFactorToken and otp are required",
      });
    }

    const decoded = verifyToken(pendingTwoFactorToken);
    if (decoded.type !== "2fa_pending") {
      return res.status(400).json({
        success: false,
        message: "Invalid 2FA session",
      });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    const lockUntil = user.twoFactorLockUntil ? new Date(user.twoFactorLockUntil) : null;
    if (lockUntil && lockUntil.getTime() > Date.now()) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked due to too many failed 2FA attempts. Please try again later.",
      });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA is not enabled for this user",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: String(otp),
      window: 1,
    });

    if (!verified) {
      const nextAttempts = (user.twoFactorFailedAttempts || 0) + 1;
      user.twoFactorFailedAttempts = nextAttempts;

      if (nextAttempts >= 5) {
        user.twoFactorLockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.twoFactorFailedAttempts = 0;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = null;
    user.lastLogin = new Date();
    user.lastLoginIp = getClientIp(req);
    await user.save();

    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });
    const userData = sanitizeUser(user);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("2FA verify-login error:", error);
    res.status(500).json({
      success: false,
      message: "2FA verification failed",
      error: error.message,
    });
  }
};

/**
 * Register a new user (public)
 */
export const register = async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: "email, password, full_name and phone are required",
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email,
      password: hashed,
      name: full_name,
      phone,
      role: role || "client",
      isActive: true,
    });

    const userData = sanitizeUser(newUser);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: userData,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * Request OTP for phone login
 */
export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Find user by phone
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = `otp_${Date.now()}_${Math.random()}`;

    // Store OTP (expires in 10 minutes)
    otpStore.set(sessionId, {
      phone,
      otp,
      userId: user.id,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP via SMS
    await smsService.sendOTP(phone, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        sessionId,
        expiresIn: 600, // seconds
      },
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

/**
 * Verify OTP and login
 */
export const verifyOTP = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Session ID and OTP are required",
      });
    }

    // Get OTP from store
    const otpData = otpStore.get(sessionId);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    // Check expiration
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(sessionId);
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Get user
    const user = await User.findByPk(otpData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Mark phone as verified
    if (!user.phoneVerified) {
      user.phoneVerified = true;
    }
    user.lastLogin = new Date();
    user.lastLoginIp = getClientIp(req);
    await user.save();

    // Clear OTP from store
    otpStore.delete(sessionId);

    // Generate tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const userData = sanitizeUser(user);

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: {
        user: userData,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Get user
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const newToken = generateToken({ userId: user.id, role: user.role });

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = generateToken({ userId: user.id, type: "reset" });

    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message,
    });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (decoded.type !== "reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // Get user
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};

/**
 * Logout (client-side token deletion)
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * Request password reset (Super Admin Approval Workflow)
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for existing pending request
    const existingRequest = await PasswordReset.findOne({
      where: {
        userId: user.id,
        status: "pending",
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A pending request already exists" });
    }

    await PasswordReset.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    res.json({
      success: true,
      message: "Password reset request submitted for approval",
    });
  } catch (error) {
    console.error("Request reset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get pending password reset requests (Super Admin)
 */
export const getPendingResets = async (req, res) => {
  try {
    const requests = await PasswordReset.findAll({
      where: { status: "pending" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(requests);
  } catch (error) {
    console.error("Get pending resets error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Approve password reset (Super Admin)
 */
export const approvePasswordReset = async (req, res) => {
  try {
    const request = await PasswordReset.findByPk(req.params.id, {
      include: [{ model: User, as: "user" }],
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Generate new password
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await request.user.update({ password: hashedPassword });

    // Update request status
    await request.update({
      status: "approved",
      approvedBy: req.user.id,
      approvedDate: new Date(),
    });

    // Send email with new password
    await emailService.sendPasswordEmail(request.user, newPassword);

    res.json({
      success: true,
      message: "Password reset approved and new password sent to user",
    });
  } catch (error) {
    console.error("Approve reset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Reject password reset (Super Admin)
 */
export const rejectPasswordReset = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await PasswordReset.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    await request.update({
      status: "rejected",
      approvedBy: req.user.id, // Rejected by
      approvedDate: new Date(),
      rejectionReason,
    });

    res.json({
      success: true,
      message: "Password reset request rejected",
    });
  } catch (error) {
    console.error("Reject reset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  register,
  login,
  setupTwoFactor,
  confirmTwoFactor,
  verifyTwoFactorLogin,
  requestOTP,
  verifyOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
  requestPasswordReset,
  getPendingResets,
  approvePasswordReset,
  rejectPasswordReset,
};
