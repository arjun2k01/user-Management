import express from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";
import {
  validateUserIdParam,
  validateUserUpdate,
  handleValidationErrors,
} from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get("/", asyncHandler(getUsers));

router.put(
  "/:id",
  ...validateUserIdParam,
  ...validateUserUpdate,
  handleValidationErrors,
  asyncHandler(updateUser)
);

router.delete(
  "/:id",
  ...validateUserIdParam,
  handleValidationErrors,
  asyncHandler(deleteUser)
);

export default router;
