/**
 * Performance Metrics Routes
 * Endpoints for retrieving and analyzing performance data
 */

import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getPerformanceMetrics,
  getPerformanceTrends,
  getPerformanceComparison,
  getPerformanceAnomalies,
} from '../controllers/performanceMetrics.controller.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

/**
 * GET /api/v1/performance/:serviceId/metrics
 * Get raw performance metrics for a service
 * Query params:
 *   - timeRange: '1h', '24h', '7d', '30d', '90d' (default: 24h)
 *   - location: Filter by region
 *   - statusCode: Filter by HTTP status
 *   - limit: Number of records (default: 100)
 *   - skip: Pagination offset
 */
router.get('/:serviceId/metrics', getPerformanceMetrics);

/**
 * GET /api/v1/performance/:serviceId/trends
 * Get performance trends over time
 * Query params:
 *   - granularity: 'hourly', 'daily', 'weekly' (default: hourly)
 *   - timeRange: '24h', '7d', '30d' (default: 24h)
 * Returns aggregated metrics grouped by time
 */
router.get('/:serviceId/trends', getPerformanceTrends);

/**
 * GET /api/v1/performance/:serviceId/comparison
 * Compare current performance vs previous period
 * Query params:
 *   - timeRange: '24h', '7d', '30d' (default: 24h)
 * Returns percentage changes and trend analysis
 */
router.get('/:serviceId/comparison', getPerformanceComparison);

/**
 * GET /api/v1/performance/:serviceId/anomalies
 * Get detected performance anomalies
 * Query params:
 *   - limit: Number of anomalies to return (default: 50)
 * Returns list of anomalies with confidence scores
 */
router.get('/:serviceId/anomalies', getPerformanceAnomalies);

export default router;
