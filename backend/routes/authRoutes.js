import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protect, getMe);
router.post("/change-password", protect, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get('*', (req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export default router;
