import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

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

  res.status(201).json({ user });
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

  res.json({ user });
};

export const logout = async (req, res) => {
  res.clearCookie("token");
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

  res.json({ message: "Password updated successfully" });
};

// You can implement real email flow later
export const forgotPassword = async (req, res) => {
  res.json({
    message: "Password reset instructions would be sent in a real system.",
  });
};
