import { body, param, validationResult } from "express-validator";

export const validateSignup = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateChangePassword = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// NEW: user update / delete validation
export const validateUserIdParam = [
  param("id").isMongoId().withMessage("Invalid user id"),
];

export const validateUserUpdate = [
  body("name").optional().isString().trim(),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role must be admin or user"),
  body("status")
    .optional()
    .isIn(["active", "pending", "disabled"])
    .withMessage("Invalid status"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(
      errors
        .array()
        .map((e) => e.msg)
        .join(", ")
    );
    err.statusCode = 400;
    return next(err);
  }
  next();
};
