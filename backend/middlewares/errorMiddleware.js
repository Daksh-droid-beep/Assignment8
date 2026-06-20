/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:", {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });

  // Handle invalid Mongoose ObjectId (CastError)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      message: `Invalid ID format for task. Provided ID: '${err.value}'`,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      message: "Database validation failed",
      errors: messages,
    });
  }

  // General fallback error response
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "An unexpected server error occurred",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
