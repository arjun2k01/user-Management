import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/users
 * Query params:
 *  - search: string
 *  - role: "All" | "Admin" | "Manager" | "User"
 *  - status: "All" | "Active" | "Inactive"
 *  - page: number (default 1)
 *  - limit: number (default 10)
 *  - sortBy: "name" | "email" | "createdAt" (default "createdAt")
 *  - sortOrder: "asc" | "desc" (default "desc")
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      search = "",
      role,
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      query.role = role;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("List users error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/users/:id
 * Edit name, role, status (NOT password here)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, role, status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/users/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
