import express from "express";
import {
  signup,
  login,
  logout,
  changePassword,
  forgotPassword,
  requestPasswordReset,
  resetPassword,
  me,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  validateSignup,
  validateLogin,
  validateChangePassword,
  validateRequestReset,
  validateResetPassword,
  handleValidationErrors,
} from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.post("/signup", authLimiter, ...validateSignup, handleValidationErrors, asyncHandler(signup));
router.post("/login", authLimiter, ...validateLogin, handleValidationErrors, asyncHandler(login));

router.get("/me", authMiddleware, asyncHandler(me));
router.post("/logout", authMiddleware, asyncHandler(logout));

router.post(
  "/change-password",
  authMiddleware,
  ...validateChangePassword,
  handleValidationErrors,
  asyncHandler(changePassword)
);

router.post(
  "/request-password-reset",
  authLimiter,
  ...validateRequestReset,
  handleValidationErrors,
  asyncHandler(requestPasswordReset)
);

router.post(
  "/reset-password",
  authLimiter,
  ...validateResetPassword,
  handleValidationErrors,
  asyncHandler(resetPassword)
);

// Back-compat
router.post("/forgot-password", authLimiter, asyncHandler(forgotPassword));

export default router;
