const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  logger.warn(`Resource Not Found: ${req.method} ${req.originalUrl}`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  if (statusCode >= 500) {
    logger.error(`API Error: ${req.method} ${req.originalUrl} [Status ${statusCode}] - ${err.message}`, err);
  } else {
    logger.warn(`API Client Error: ${req.method} ${req.originalUrl} [Status ${statusCode}] - ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred.",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};

