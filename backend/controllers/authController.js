import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const isProd = process.env.NODE_ENV === "production";

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,                   // 🔑 required with SameSite: "none"
    sameSite: isProd ? "none" : "lax", // 🔑 allows cross-site cookies in prod
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email is already registered");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({ user: buildUserPayload(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({ user: buildUserPayload(user) });
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const match = await user.comparePassword(oldPassword);
  if (!match) {
    const err = new Error("Old password is incorrect");
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  await user.save();

  // Optional: issue a fresh token after password change
  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({ message: "Password updated successfully" });
};

// You can implement real email flow later
export const forgotPassword = async (req, res) => {
  res.json({
    message: "Password reset instructions would be sent in a real system.",
  });
};
