/**
 * Global Error Handler Middleware
 * Catches all errors (sync, async, and from async handlers)
 * Standardizes error responses and logs errors
 */

import { ERROR_CODES, getErrorCode, getErrorCodeFromStatus } from '../utils/errorCodes.js';
import { getLoggerService } from '../services/loggerService.js';

const logger = getLoggerService();

/**
 * Main error handler middleware
 * Must be added AFTER all other routes and middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'SRV_001';
  let errors = [];
  let details = {};

  // Log the error with full context
  const correlationId = req.correlationId || 'unknown';
  const errorContext = {
    correlationId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  };

  // Handle ApiError instances (custom errors thrown by our code)
  if (err.name === 'ApiError' || err.statusCode) {
    statusCode = err.statusCode || 500;
    message = err.message;
    errorCode = err.errorCode || getErrorCodeFromStatus(statusCode);
    errors = err.errors || [];
    details = err.details || {};

    logger.warn('API Error', {
      ...errorContext,
      errorCode,
      message,
      statusCode,
      errors,
    });
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VAL_002';
    message = 'Validation error';
    errors = Object.entries(err.errors || {}).map(([field, error]) => ({
      field,
      message: error.message,
    }));

    logger.warn('Validation Error', {
      ...errorContext,
      errorCode,
      errors,
    });
  }
  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'VAL_002';
    message = `Invalid ${err.kind}`;
    errors = [{ field: err.path, message: `Invalid ${err.kind}` }];

    logger.warn('Cast Error', {
      ...errorContext,
      errorCode,
      errors,
    });
  }
  // Handle Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DB_004';
    message = 'Duplicate key error';
    const field = Object.keys(err.keyValue || {})[0];
    errors = [{ field, message: `${field} already exists` }];

    logger.warn('Duplicate Key Error', {
      ...errorContext,
      errorCode,
      errors,
    });
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'AUTH_004';
    message = 'Invalid token';

    logger.warn('JWT Error', {
      ...errorContext,
      errorCode,
      message: err.message,
    });
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'AUTH_004';
    message = 'Token expired';

    logger.warn('Token Expired Error', {
      ...errorContext,
      errorCode,
    });
  }
  // Handle CORS errors
  else if (err.message?.includes('Not allowed by CORS')) {
    statusCode = 403;
    errorCode = 'USER_001';
    message = 'CORS policy violation';

    logger.warn('CORS Error', {
      ...errorContext,
      origin: err.origin,
    });
  }
  // Handle rate limit errors (express-rate-limit)
  else if (err.status === 429) {
    statusCode = 429;
    errorCode = 'RATE_001';
    message = 'Too many requests. Please try again later.';

    logger.warn('Rate Limit Exceeded', {
      ...errorContext,
      retryAfter: err.retryAfter,
    });
  }
  // Handle generic Error
  else if (err instanceof Error) {
    statusCode = 500;
    errorCode = 'SRV_001';
    message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message;

    logger.error('Unhandled Error', {
      ...errorContext,
      errorCode,
      message: err.message,
      stack: err.stack,
    });
  }
  // Handle unknown error types
  else {
    logger.error('Unknown Error Type', {
      ...errorContext,
      errorType: typeof err,
      error: String(err),
    });
  }

  // Never expose stack traces in production
  const response = {
    success: false,
    errorCode,
    message,
    ...(errors.length > 0 && { errors }),
    ...(Object.keys(details).length > 0 && { details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    correlationId, // For debugging across services
  };

  // Set response headers
  res.status(statusCode);
  res.set('Content-Type', 'application/json');
  res.set('X-Error-Code', errorCode);
  res.set('X-Correlation-ID', correlationId);

  // Send response
  res.json(response);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 * Should be added BEFORE error handler
 */
export const notFoundHandler = (req, res, next) => {
  const errorCode = 'SRV_003';
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  
  const logger = getLoggerService();
  logger.warn('Route Not Found', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    errorCode,
    message,
    correlationId: req.correlationId,
  });
};

/**
 * Graceful error handlers for different error scenarios
 */
export const handleDatabaseError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    return {
      statusCode: 409,
      errorCode: 'DB_004',
      message: `${field} already exists`,
      errors: [{ field, message: `${field} already exists` }],
    };
  }

  if (error.name === 'ValidationError') {
    const errors = Object.entries(error.errors || {}).map(([field, err]) => ({
      field,
      message: err.message,
    }));
    return {
      statusCode: 400,
      errorCode: 'VAL_002',
      message: 'Validation error',
      errors,
    };
  }

  return {
    statusCode: 500,
    errorCode: 'DB_002',
    message: 'Database operation failed',
  };
};

/**
 * Create standardized error response
 */
export const createErrorResponse = (statusCode, errorCode, message, errors = [], details = {}) => {
  return {
    success: false,
    errorCode,
    message,
    ...(errors.length > 0 && { errors }),
    ...(Object.keys(details).length > 0 && { details }),
  };
};
