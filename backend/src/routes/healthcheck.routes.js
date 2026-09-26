import express from "express";
import mongoose from "mongoose";
import { isRedisConnected, redisHealthCheck, getRedisInfo } from "../services/redisService.js";
import { getLoggerService } from "../services/loggerService.js";

const router = express.Router();
const logger = getLoggerService();

/**
 * Simple health check endpoint
 * Returns 200 if server is running
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
  });
});

/**
 * Detailed health check endpoint
 * Returns comprehensive health status including all dependencies
 */
router.get("/detailed", async (req, res) => {
  try {
    const correlationId = req.correlationId || 'unknown';

    // Check MongoDB
    const mongoHealth = {
      connected: mongoose.connection.readyState === 1, // 1 = connected
      readyState: mongoose.connection.readyState,
    };

    // Check Redis
    let redisHealth = {
      connected: isRedisConnected(),
      healthy: false,
    };

    try {
      const redisHealthy = await redisHealthCheck();
      const redisInfo = await getRedisInfo();
      redisHealth = {
        ...redisHealth,
        healthy: redisHealthy,
        info: redisInfo,
      };
    } catch (error) {
      logger.warn('Redis health check failed', { error: error.message });
      redisHealth.error = error.message;
    }

    // Overall status
    const overallHealthy = mongoHealth.connected && redisHealth.healthy;

    const response = {
      status: overallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      dependencies: {
        mongodb: mongoHealth,
        redis: redisHealth,
      },
      correlationId,
    };

    const statusCode = overallHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      correlationId: req.correlationId,
    });

    res.status(503).json({
      status: 'unhealthy',
      message: error.message,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    });
  }
});

/**
 * Kubernetes-style liveness probe
 * Returns 200 if server is alive
 */
router.get("/live", (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Kubernetes-style readiness probe
 * Returns 200 only if all dependencies are ready
 */
router.get("/ready", async (req, res) => {
  try {
    const mongoReady = mongoose.connection.readyState === 1;
    const redisReady = await redisHealthCheck().catch(() => false);

    const allReady = mongoReady && redisReady;

    res.status(allReady ? 200 : 503).json({
      ready: allReady,
      mongodb: mongoReady,
      redis: redisReady,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
