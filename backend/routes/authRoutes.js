import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ---------- SIGNUP ---------- */
router.post("/signup", async (req, res) => {
  // ... (same as before)
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  // ... (same as before)
});

/* ---------- CHANGE PASSWORD (LOGGED IN) ---------- */
// POST /api/auth/change-password
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- FORGOT PASSWORD (DEMO) ---------- */
// WARNING: This is a simplified version JUST for learning.
// In real apps you MUST use email + token reset flow.
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists in real apps
      return res.status(400).json({ message: "No user found with this email" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successfully (demo flow)" });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
