import express from "express";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";

import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below require login
router.use(protect);

// Admin-only
router.get("/", restrictTo("admin"), getAllUsers);
router.patch("/:id/role", restrictTo("admin"), updateUserRole);
router.patch("/:id/status", restrictTo("admin"), updateUserStatus);
router.delete("/:id", restrictTo("admin"), deleteUser);

export default router;
