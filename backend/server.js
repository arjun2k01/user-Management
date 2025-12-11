// server.js
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import "express-async-errors";

const app = express();

// ====== CONNECT DB ======
await connectDB();

// ====== MIDDLEWARES ======
app.use(helmet()); // secure headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" })); // limit body size to avoid abuse
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ====== HEALTHCHECK ======
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

// ====== ROUTES ======
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// ====== ERROR HANDLING ======
app.use(notFound);
app.use(errorHandler);

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
