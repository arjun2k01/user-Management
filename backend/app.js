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

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ---------- CORS ----------
const normalizeOrigin = (o = "") => o.trim().replace(/\/$/, "");

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const isProd = process.env.NODE_ENV === "production";
if (isProd && allowedOrigins.length === 0) {
  throw new Error("CORS_ALLOWED_ORIGINS is required in production.");
}

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const clean = normalizeOrigin(origin);
    if (allowedOrigins.includes(clean)) return cb(null, true);

    const allowVercelPreviews =
      String(process.env.ALLOW_VERCEL_PREVIEWS || "").toLowerCase() === "true";

    if (allowVercelPreviews) {
      try {
        const url = new URL(clean);
        if (url.hostname.endsWith(".vercel.app")) return cb(null, true);
      } catch (_) {}
    }

    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---------- Logging ----------
app.use(
  morgan("dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// Rate limit all API routes
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    allowedOrigins,
  })
);

// Error handler
app.use(errorHandler);

export default app;
