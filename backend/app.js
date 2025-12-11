// backend/app.js
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

// Security & parsing
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CORS_ALLOWED_ORIGINS || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      if (!origin || allowed.length === 0 || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Logging
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
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" })
);

// Error handler
app.use(errorHandler);

export default app;
