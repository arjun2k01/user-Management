// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};
