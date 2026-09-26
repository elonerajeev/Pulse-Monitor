import { ApiError } from "../utils/ApiError.js";

// Final error handler. Without this Express renders its default HTML page,
// which exposes stack traces and absolute filesystem paths to callers.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : err.statusCode || 500;

  if (!isApiError || statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: isApiError ? err.message : "Internal server error",
    errors: isApiError ? err.errors : [],
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
