import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const isProd = process.env.NODE_ENV === "production";

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email is already registered");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({ user: buildUserPayload(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({ user: buildUserPayload(user) });
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
};

export const me = async (req, res) => {
  res.json({ user: buildUserPayload(req.user) });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const match = await user.comparePassword(oldPassword);
  if (!match) {
    const err = new Error("Old password is incorrect");
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  await user.save();

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({ message: "Password updated successfully" });
};

/**
 * ✅ STEP 1: Request reset token
 * In production: email the reset link to the user
 */
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return generic message (avoid email enumeration)
  const genericMsg =
    "If the email exists, you'll receive reset instructions.";

  if (!user) {
    return res.json({ message: genericMsg });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save();

  // ✅ For now (dev): return token so you can test without email service
  // In production you would send: `${FRONTEND_URL}/reset-password?token=${token}`
  return res.json({
    message: genericMsg,
    ...(isProd ? {} : { token }), // only expose token in dev
  });
};

/**
 * ✅ STEP 2: Reset password using token
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    const err = new Error("Reset token is invalid or expired");
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  res.json({ message: "Password reset successfully. Please log in." });
};
