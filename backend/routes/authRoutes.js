import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validateSignup, validateLogin, validateChangePassword, handleValidationErrors } from "../middlewares/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

/* ---------- SIGNUP WITH VALIDATION & RATE LIMITING ---------- */
router.post(
  "/signup",
  authLimiter,
  ...validateSignup,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ success: true, message: "Signup successful", token, user: { id: user._id, name: user.name, email: user.email } });
  })
);

/* ---------- LOGIN WITH VALIDATION & RATE LIMITING ---------- */
router.post(
  "/login",
  authLimiter,
  ...validateLogin,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
  })
);

/* ---------- CHANGE PASSWORD (LOGGED IN) ---------- */
router.post(
  "/change-password",
  authMiddleware,
  ...validateChangePassword,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  })
);

/* ---------- FORGOT PASSWORD (SECURE VERSION) ---------- */
/* NOTE: This should ideally send an email with reset token.
   For production, implement proper email verification flow.
   Current version is for demo only and should NOT be used in production
   without proper email verification. */
router.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "No user found with this email" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ success: true, message: "Password reset successfully. Please note: In production, verify email before allowing reset." });
  })
);

export default router;