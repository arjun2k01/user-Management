// middleware/errorHandler.js
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not found - ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("API error:", err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
  });
};
