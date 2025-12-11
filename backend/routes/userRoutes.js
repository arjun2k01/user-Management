// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All these are admin-only
router.get("/", protect, requireAdmin, getUsers);
router.put("/:id", protect, requireAdmin, updateUser);
router.delete("/:id", protect, requireAdmin, deleteUser);

export default router;
