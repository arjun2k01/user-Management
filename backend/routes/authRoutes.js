import express from "express";
import { signup, login, changePassword, forgotPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validateSignup, validateLogin, validateChangePassword, handleValidationErrors } from "../middlewares/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

/* ---------- SIGNUP WITH VALIDATION & RATE LIMITING ---------- */
router.post("/signup", authLimiter, ...validateSignup, handleValidationErrors, asyncHandler(signup));

/* ---------- LOGIN WITH VALIDATION & RATE LIMITING ---------- */
router.post("/login", authLimiter, ...validateLogin, handleValidationErrors, asyncHandler(login));

/* ---------- CHANGE PASSWORD (LOGGED IN) ---------- */
router.post("/change-password", authMiddleware, ...validateChangePassword, handleValidationErrors, asyncHandler(changePassword));

/* ---------- FORGOT PASSWORD ---------- */
router.post("/forgot-password", authLimiter, asyncHandler(forgotPassword));

export default router;