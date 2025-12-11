import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  const status = err.statusCode || 500;
  const message =
    status === 500 ? "Internal server error" : err.message || "Error";

  res.status(status).json({ message });
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
