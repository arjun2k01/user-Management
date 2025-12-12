import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { validatePasswordStrength } from "../utils/validatePasswordStrength.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", // important for Vercel+Render cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: new Date(0),
  });
};

// ✅ SAFE: Only create admin for FIRST_ADMIN_EMAIL when FIRST_ADMIN_CREATE=true
const resolveRoleOnSignup = async (email) => {
  const allow = String(process.env.FIRST_ADMIN_CREATE || "").toLowerCase() === "true";
  const firstAdminEmail = (process.env.FIRST_ADMIN_EMAIL || "").trim().toLowerCase();
  if (!allow || !firstAdminEmail) return "user";
  if (email.trim().toLowerCase() !== firstAdminEmail) return "user";

  // allow only if no admin exists yet
  const adminExists = await User.exists({ role: "admin" });
  if (adminExists) return "user";
  return "admin";
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // ✅ stronger password validation
  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.ok) {
    return res.status(400).json({ message: pwCheck.message });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email is already registered" });

  const role = await resolveRoleOnSignup(email);

  const user = await User.create({ name, email, password, role });
  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  if (user.status === "disabled") {
    return res.status(403).json({ message: "Your account has been disabled" });
  }

  const ok = await user.correctPassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
};

export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
    },
  });
};

// ======== RESET PASSWORD (production UX) ========

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Always respond success (no account enumeration)
  if (!user) return res.json({ message: "If an account exists, a reset link has been sent." });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save({ validateBeforeSave: false });

  const frontend = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${frontend.replace(/\/$/, "")}/reset-password?token=${rawToken}`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Password reset</h2>
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <p><a href="${resetUrl}" target="_blank" rel="noreferrer">Reset your password</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html,
  });

  res.json({ message: "If an account exists, a reset link has been sent." });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.ok) return res.status(400).json({ message: pwCheck.message });

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) return res.status(400).json({ message: "Token is invalid or has expired" });

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Auto-login after reset
  const jwtToken = signToken(user._id);
  setTokenCookie(res, jwtToken);

  res.json({ message: "Password reset successful" });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const pwCheck = validatePasswordStrength(newPassword);
  if (!pwCheck.ok) return res.status(400).json({ message: pwCheck.message });

  const user = await User.findById(req.user._id).select("+password");
  const ok = await user.correctPassword(currentPassword);
  if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
};
