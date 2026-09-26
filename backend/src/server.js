import mongoose from "mongoose";
import connectDB from "./db/connectdb.js";
import app from "./app.js"; // Import configured app
import { setupGracefulShutdown, registerShutdownService } from "./services/gracefulShutdownService.js";
import { getLoggerService, initializeLogger } from "./services/loggerService.js";
import { initializeRedis, closeRedis } from "./services/redisService.js";

// Initialize logger first
initializeLogger();
const logger = getLoggerService();

const PORT = process.env.PORT || 5000;

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✓ Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', { error: error.message });
    process.exit(1);
  }

  try {
    // Initialize Redis (optional - continue even if fails)
    await initializeRedis();
    logger.info('✓ Redis initialized');
  } catch (error) {
    logger.warn('Redis initialization failed (continuing without Redis):', { 
      error: error.message,
    });
    // Don't exit - continue without Redis, but log warning
  }
};

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`✓ Server is running on http://localhost:${PORT}`);
});

// Initialize all services
initializeServices().catch((error) => {
  logger.error('Failed to initialize services:', { error: error.message });
  process.exit(1);
});

// Register graceful shutdown handlers
registerShutdownService('Redis', async () => {
  await closeRedis();
  logger.info('✓ Redis disconnected');
});

registerShutdownService('Background Jobs', async () => {
  // Will be populated when job queue is integrated
  logger.info('Background jobs stopped');
});

// Setup graceful shutdown
setupGracefulShutdown(server);

logger.info('Graceful shutdown handlers initialized');
