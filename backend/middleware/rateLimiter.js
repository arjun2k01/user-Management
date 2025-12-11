// middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // max 20 requests per IP for auth endpoints
  message: {
    success: false,
    message: "Too many attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
