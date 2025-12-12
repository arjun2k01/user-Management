import mongoose from "mongoose";
import User from "../models/User.js";

// GET /api/users (admin)
export const getAllUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10", 10)));
  const q = (req.query.q || "").trim();
  const role = (req.query.role || "").trim(); // optional filter
  const status = (req.query.status || "").trim(); // optional filter

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password"),
  ]);

  res.json({
    users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
};

// PATCH /api/users/:id/role (admin)
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Optional safety: don't allow admin to demote themselves
  if (String(req.user?._id) === String(id) && role !== "admin") {
    return res.status(400).json({ message: "You cannot remove your own admin role" });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user });
};

// PATCH /api/users/:id/status (admin)
export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (!["active", "disabled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Optional safety: don't allow admin to disable themselves
  if (String(req.user?._id) === String(id) && status !== "active") {
    return res.status(400).json({ message: "You cannot disable your own account" });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user });
};

// DELETE /api/users/:id (admin)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  // Optional safety: don't allow admin to delete themselves
  if (String(req.user?._id) === String(id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User deleted" });
};
