import express from "express";
import {
  signup,
  login,
  logout,
  changePassword,
  me,
  requestPasswordReset,
  resetPassword,
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

router.post(
  "/signup",
  authLimiter,
  ...validateSignup,
  handleValidationErrors,
  asyncHandler(signup)
);

router.post(
  "/login",
  authLimiter,
  ...validateLogin,
  handleValidationErrors,
  asyncHandler(login)
);

router.post("/logout", authMiddleware, asyncHandler(logout));
router.get("/me", authMiddleware, asyncHandler(me));

router.post(
  "/change-password",
  authMiddleware,
  ...validateChangePassword,
  handleValidationErrors,
  asyncHandler(changePassword)
);

// ✅ New secure reset flow
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

export default router;
