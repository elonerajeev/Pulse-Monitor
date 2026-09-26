/**
 * Graceful Shutdown Service
 * Handles clean server shutdown with proper resource cleanup
 */

import mongoose from 'mongoose';
import { getLoggerService } from './loggerService.js';

const logger = getLoggerService();

let isShuttingDown = false;
const registeredServices = [];

/**
 * Register a service for graceful shutdown
 * @param {string} name - Service name
 * @param {Function} shutdownFn - Async function to execute on shutdown
 */
export const registerShutdownService = (name, shutdownFn) => {
  registeredServices.push({ name, shutdownFn });
};

/**
 * Setup graceful shutdown handlers
 * @param {http.Server} server - Express server instance
 */
export const setupGracefulShutdown = (server) => {
  const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
      logger.warn(`Graceful shutdown already in progress, forcing exit`);
      process.exit(1);
    }

    isShuttingDown = true;

    logger.info(`Received ${signal}, starting graceful shutdown...`);

    try {
      // Step 1: Stop accepting new requests
      logger.info('Stopping new request acceptance...');
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Step 2: Shutdown registered services in reverse order
          for (let i = registeredServices.length - 1; i >= 0; i--) {
            const { name, shutdownFn } = registeredServices[i];
            try {
              logger.info(`Shutting down service: ${name}...`);
              await Promise.race([
                shutdownFn(),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error(`${name} shutdown timeout`)),
                    5000
                  )
                ),
              ]);
              logger.info(`✓ ${name} shutdown successfully`);
            } catch (err) {
              logger.error(`✗ Error shutting down ${name}:`, {
                error: err.message,
              });
            }
          }

          // Step 3: Close database connections
          logger.info('Closing MongoDB connection...');
          await mongoose.disconnect();
          logger.info('✓ MongoDB disconnected');

          logger.info('Graceful shutdown completed successfully');
          process.exit(0);
        } catch (err) {
          logger.error('Error during graceful shutdown:', {
            error: err.message,
          });
          process.exit(1);
        }
      });

      // Timeout for graceful shutdown (30 seconds)
      const shutdownTimeout = setTimeout(() => {
        logger.error('Graceful shutdown timeout, forcing exit');
        process.exit(1);
      }, 30000);

      shutdownTimeout.unref();
    } catch (err) {
      logger.error('Fatal error during shutdown:', { error: err.message });
      process.exit(1);
    }
  };

  // Register signal handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: String(reason),
      promise: String(promise),
    });
    // Don't exit on unhandled rejection, just log it
  });

  // Handle warnings
  process.on('warning', (warning) => {
    logger.warn('Process Warning:', {
      name: warning.name,
      message: warning.message,
      code: warning.code,
    });
  });

  logger.info('Graceful shutdown handlers registered');
};

/**
 * Wait for pending operations to complete
 */
export const waitForPendingOperations = async (maxWaitMs = 5000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    // Check if there are any pending promises
    // This is a simplified check; in production, you might track specific operations
    if (process.listenerCount('beforeExit') === 0) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

/**
 * Trigger manual shutdown (useful for testing)
 */
export const triggerShutdown = async (signal = 'SIGTERM') => {
  logger.info(`Triggering shutdown with signal: ${signal}`);
  process.emit(signal);
};

export default setupGracefulShutdown;
