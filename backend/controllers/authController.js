import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";

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
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
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

  const user = await User.create({ name, email, password, role: "admin" });
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

  if (user.status === "disabled") {
    const err = new Error("Your account is disabled");
    err.statusCode = 403;
    throw err;
  }

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({ user: buildUserPayload(user) });
};

export const me = async (req, res) => {
  res.json({ user: buildUserPayload(req.user) });
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
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
 * Request a reset email with a token.
 * Always returns generic success message (prevents email enumeration).
 */
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const genericMsg =
    "If an account exists for that email, you'll receive password reset instructions shortly.";

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: genericMsg });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  if (!frontendUrl) {
    const err = new Error("FRONTEND_URL is not set. Configure it to send reset links.");
    err.statusCode = 500;
    throw err;
  }

  const resetLink = `${frontendUrl.replace(/\\/$/ "")}/reset-password?token=${rawToken}`;

  const subject = "Reset your password";
  const text = `You requested a password reset. Use this link (valid for 15 minutes):\\n\\n${resetLink}\\n\\nIf you didn't request this, ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Reset your password</h2>
      <p>You requested a password reset. Click below (valid for <b>15 minutes</b>):</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 14px;background:#10b981;color:#0b1220;text-decoration:none;border-radius:10px;font-weight:700;">
          Reset password
        </a>
      </p>
      <p style="color:#475569;font-size:12px;">If the button doesn't work, copy and paste:</p>
      <p style="color:#0f172a;font-size:12px;word-break:break-all;">${resetLink}</p>
    </div>
  `;

  await sendMail({ to: user.email, subject, html, text });

  return res.json({ message: genericMsg });
};

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

  res.json({ message: "Password reset successfully. Please sign in." });
};

// Back-compat: keeps old frontend working
export const forgotPassword = async (req, res) => requestPasswordReset(req, res);
