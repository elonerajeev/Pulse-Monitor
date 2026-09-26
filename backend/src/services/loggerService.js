/**
 * Logger Service
 * Centralized logging with Winston
 * Supports multiple transports and structured JSON logging
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let logger;

/**
 * Initialize logger
 */
export const initializeLogger = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  // Define custom levels
  const customLevels = {
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
      trace: 5,
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'blue',
      trace: 'gray',
    },
  };

  // Define transports
  const transports = [
    // Console transport
    new winston.transports.Console({
      format: isDevelopment
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(
              (info) => `${info.timestamp} [${info.level}] ${info.message}`,
            ),
          )
        : winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json(),
          ),
    }),
  ];

  // Add file transports in production
  if (!isDevelopment) {
    transports.push(
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  // Create logger
  logger = winston.createLogger({
    levels: customLevels.levels,
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: {
      service: 'pulse-monitor-backend',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
    },
    transports,
  });

  winston.addColors(customLevels.colors);

  return logger;
};

/**
 * Get logger instance
 */
export const getLoggerService = () => {
  if (!logger) {
    initializeLogger();
  }
  return logger;
};

/**
 * Log HTTP request
 */
export const logHttpRequest = (req, res, duration) => {
  const logger = getLoggerService();
  const correlationId = req.correlationId || 'unknown';

  const logData = {
    correlationId,
    method: req.method,
    path: req.path,
    query: req.query,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userId: req.user?.id,
    userEmail: req.user?.email,
    userAgent: req.get('user-agent'),
  };

  if (res.statusCode >= 500) {
    logger.error('HTTP Request', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

/**
 * Log security event
 */
export const logSecurityEvent = (eventType, data) => {
  const logger = getLoggerService();
  const correlationId = data.correlationId || 'unknown';

  logger.warn(`Security Event: ${eventType}`, {
    correlationId,
    timestamp: new Date().toISOString(),
    ...data,
  });
};

/**
 * Log authentication event
 */
export const logAuthEvent = (eventType, userId, email, ipAddress, success = true) => {
  const logger = getLoggerService();

  const level = success ? 'info' : 'warn';
  const message = `Auth Event: ${eventType}`;

  logger[level](message, {
    eventType,
    userId,
    email,
    ipAddress,
    success,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log database operation
 */
export const logDatabaseOperation = (operation, collection, duration, success = true, error = null) => {
  const logger = getLoggerService();

  if (success) {
    logger.debug(`DB Operation: ${operation}`, {
      operation,
      collection,
      duration: `${duration}ms`,
      success: true,
    });
  } else {
    logger.error(`DB Operation: ${operation}`, {
      operation,
      collection,
      duration: `${duration}ms`,
      success: false,
      error: error?.message,
    });
  }
};

/**
 * Log external API call
 */
export const logExternalAPICall = (service, endpoint, method, statusCode, duration, error = null) => {
  const logger = getLoggerService();

  const level = statusCode >= 400 ? 'warn' : 'debug';
  const message = `External API: ${service}`;

  logger[level](message, {
    service,
    endpoint,
    method,
    statusCode,
    duration: `${duration}ms`,
    success: statusCode < 400,
    error: error?.message,
  });
};

/**
 * Log webhook event
 */
export const logWebhookEvent = (webhookUrl, eventType, statusCode, duration, success = true, error = null) => {
  const logger = getLoggerService();

  const level = success ? 'info' : 'warn';
  logger[level]('Webhook Event', {
    webhookUrl,
    eventType,
    statusCode,
    duration: `${duration}ms`,
    success,
    error: error?.message,
  });
};

/**
 * Log monitoring check
 */
export const logMonitoringCheck = (serviceId, url, statusCode, responseTime, success = true, error = null) => {
  const logger = getLoggerService();

  if (!success) {
    logger.warn('Monitoring Check Failed', {
      serviceId,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      error: error?.message,
    });
  } else {
    logger.debug('Monitoring Check', {
      serviceId,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
    });
  }
};

export default getLoggerService();
