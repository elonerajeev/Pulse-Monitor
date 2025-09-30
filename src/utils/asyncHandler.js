const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      // Using statusCode instead of code, and ensuring it's a valid HTTP status code
      const statusCode = error?.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  };
};

module.exports = asyncHandler;
