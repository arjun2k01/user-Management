import express from "express";
import { getAllUsers, getUserById, updateUser, deleteUser, getCurrentUser } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

router.get("/me", authMiddleware, asyncHandler(getCurrentUser));
router.get("/", authMiddleware, asyncHandler(getAllUsers));
router.get("/:id", authMiddleware, asyncHandler(getUserById));
router.put("/:id", authMiddleware, asyncHandler(updateUser));
router.delete("/:id", authMiddleware, asyncHandler(deleteUser));

export default router;
