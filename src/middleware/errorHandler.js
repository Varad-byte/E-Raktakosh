/**
 * Centralized Error Handling Middleware for Express.
 */

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    error: err.name || 'Error',
    message: err.message || 'An unexpected error occurred',
  };

  if (err.details) {
    response.details = err.details;
  }

  if (isDev && statusCode === 500) {
    response.stack = err.stack;
  }

  console.error(`[${new Date().toISOString()}] Error ${statusCode} on ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json(response);
}

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
};
