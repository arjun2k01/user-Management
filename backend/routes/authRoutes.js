// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  forgotPassword,
  changePassword,
  getMe,
} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply rate limit to sensitive auth endpoints
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);

// Protected routes
router.post("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

export default router;
