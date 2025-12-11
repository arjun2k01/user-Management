import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      const err = new Error("Not authenticated");
      err.statusCode = 401;
      throw err;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 401;
      throw err;
    }

    req.user = user;
    next();
  } catch (err) {
    err.statusCode = err.name === "JsonWebTokenError" ? 401 : err.statusCode;
    next(err);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    const err = new Error("Admin access required");
    err.statusCode = 403;
    return next(err);
  }
  next();
};
