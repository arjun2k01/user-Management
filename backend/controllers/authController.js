// controllers/authController.js
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// POST /api/v1/auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email is already registered" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const token = generateToken(user._id, user.role);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: sanitizeUser(user),
  });
};

// POST /api/v1/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user._id, user.role);

  return res.json({
    success: true,
    message: "Login successful",
    token,
    user: sanitizeUser(user),
  });
};

// POST /api/v1/auth/forgot-password
// (simple version: email + newPassword -> update directly)
export const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body || {};

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Email and new password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // don't reveal if user exists
    return res.json({
      success: true,
      message:
        "If that email exists, the password has been updated (or you will receive a reset message).",
    });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: "New password must be at least 6 characters" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();

  return res.json({
    success: true,
    message: "Password updated successfully",
  });
};

// POST /api/v1/auth/change-password
// Protected: requires Bearer token
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters",
    });
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();

  return res.json({
    success: true,
    message: "Password changed successfully",
  });
};

// GET /api/v1/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
};
