import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import logger from "./utils/logger.js";

const app = express();

// -------- Security & parsing --------

// If you're behind Render/Proxy and using secure cookies:
// (needed for req.secure + some setups)
app.set("trust proxy", 1);

// Helmet: keep defaults, but allow cross-site cookies + API usage patterns
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// -------- CORS (Vercel + Render friendly) --------

const parseAllowedOrigins = () => {
  const raw = process.env.CORS_ALLOWED_ORIGINS || process.env.CLIENT_URL || "";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();
const isProd = process.env.NODE_ENV === "production";

if (isProd && allowedOrigins.length === 0) {
  // Fail fast in production so you don't accidentally allow everyone
  throw new Error(
    "CORS_ALLOWED_ORIGINS is required in production (comma-separated list)."
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server / tools like curl/postman (no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Optional: allow Vercel preview deployments if you use them
    // Example: https://yourapp-git-branch-username.vercel.app
    const allowVercelPreviews =
      String(process.env.ALLOW_VERCEL_PREVIEWS || "").toLowerCase() === "true";

    if (allowVercelPreviews) {
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith(".vercel.app")) return callback(null, true);
      } catch (_) {
        // ignore parsing errors
      }
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// IMPORTANT: preflight must pass with credentials too
app.options("*", cors(corsOptions));

// -------- Logging --------
app.use(
  morgan("dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// -------- Rate limit all API routes --------
app.use("/api", generalLimiter);

// -------- Routes --------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// -------- Health --------
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    allowedOrigins,
  })
);

// -------- Error handler --------
app.use(errorHandler);

export default app;
