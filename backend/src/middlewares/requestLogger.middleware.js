/**
 * Request Logger Middleware
 * Logs all HTTP requests with detailed information
 * Enables observability and debugging
 */

import { getLoggerService, logHttpRequest } from '../services/loggerService.js';

/**
 * Log incoming request and outgoing response
 */
export const requestLoggerMiddleware = (req, res, next) => {
  const logger = getLoggerService();
  const correlationId = req.correlationId || 'unknown';
  const startTime = Date.now();

  // Log incoming request
  const incomingData = {
    correlationId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    userEmail: req.user?.email,
  };

  logger.http('Incoming Request', incomingData);

  // Capture response finish event
  const originalSend = res.json;
  let responseBody;

  res.json = function (data) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const outgoingData = {
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.getHeader('content-length') || 'unknown',
      userId: req.user?.id,
    };

    // Log response
    if (res.statusCode >= 500) {
      logger.error('Request Failed', outgoingData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request Error', outgoingData);
    } else {
      logger.http('Request Success', outgoingData);
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow Request', {
        ...outgoingData,
        message: `Request took ${duration}ms (threshold: 1000ms)`,
      });
    }
  });

  next();
};

/**
 * Log body of requests for sensitive operations
 * Skip for large payloads
 */
export const requestBodyLoggerMiddleware = (req, res, next) => {
  const logger = getLoggerService();
  const correlationId = req.correlationId || 'unknown';

  // Only log body for specific methods and routes
  const shouldLogBody = 
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.path.includes('/webhook') &&
    !req.path.includes('/upload');

  if (shouldLogBody && req.body) {
    const bodySize = JSON.stringify(req.body).length;

    // Skip logging if body is too large
    if (bodySize > 10000) {
      logger.debug('Request Body (truncated - too large)', {
        correlationId,
        path: req.path,
        size: `${bodySize} bytes`,
      });
    } else {
      // Mask sensitive fields
      const sanitizedBody = sanitizeRequestBody(req.body);
      logger.debug('Request Body', {
        correlationId,
        path: req.path,
        body: sanitizedBody,
      });
    }
  }

  next();
};

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'passwordConfirm',
    'confirmPassword',
    'token',
    'refreshToken',
    'accessToken',
    'apiKey',
    'secret',
    'creditCard',
    'cardNumber',
    'cvv',
    'ssn',
    'apiSecret',
  ];

  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Log query parameters (for debugging)
 */
export const queryLoggerMiddleware = (req, res, next) => {
  const logger = getLoggerService();
  const correlationId = req.correlationId || 'unknown';

  if (Object.keys(req.query).length > 0) {
    logger.debug('Query Parameters', {
      correlationId,
      path: req.path,
      query: req.query,
    });
  }

  next();
};

export default requestLoggerMiddleware;
