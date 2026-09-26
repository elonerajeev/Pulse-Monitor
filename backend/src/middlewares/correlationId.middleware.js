/**
 * Correlation ID Middleware
 * Generates or extracts correlation ID for tracing requests end-to-end
 * Enables debugging of request flow across services
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate or extract correlation ID from request
 * Adds it to request object and response headers
 */
export const correlationIdMiddleware = (req, res, next) => {
  // Check if correlation ID already exists in headers
  let correlationId = req.headers['x-correlation-id'] ||
                      req.headers['correlation-id'] ||
                      req.headers['traceid'];

  // Generate new correlation ID if not provided
  if (!correlationId) {
    correlationId = uuidv4();
  }

  // Add to request for use in handlers
  req.correlationId = correlationId;

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('Correlation-ID', correlationId);

  // Continue to next middleware
  next();
};

/**
 * Get correlation ID from request or generate new one
 * Useful for background jobs and async tasks
 */
export const getCorrelationId = (req) => {
  return req?.correlationId || uuidv4();
};

/**
 * Create a new correlation ID for a related request/operation
 * Useful for multi-step operations where we want to track sub-operations
 */
export const createChildCorrelationId = (parentCorrelationId) => {
  return `${parentCorrelationId}-${uuidv4()}`;
};

export default correlationIdMiddleware;
