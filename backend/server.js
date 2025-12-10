import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// ============= SECURITY MIDDLEWARES =============
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// ============= LOGGING MIDDLEWARE =============
app.use(morgan("combined"));

// ============= BODY PARSER MIDDLEWARES =============
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ============= HEALTH CHECK ENDPOINT =============
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ============= API ROUTES =============
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// ============= 404 HANDLER =============
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found" 
  });
});

// ============= ERROR HANDLER MIDDLEWARE =============
app.use(errorHandler);

// ============= DATABASE CONNECTION & SERVER START =============
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

export default app;
