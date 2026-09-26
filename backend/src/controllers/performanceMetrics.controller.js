/**
 * Performance Metrics Controller
 * Handles retrieval and analysis of performance data
 * Provides insights, trends, and comparisons
 */

import PerformanceMetrics from '../models/performanceMetrics.model.js';
import Monitoring from '../models/monitoring.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * Get performance metrics for a service
 * Supports filtering by date range, location, status
 */
export const getPerformanceMetrics = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { timeRange = '24h', location, statusCode, limit = 100, skip = 0 } = req.query;

  // Validate service ID
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, 'Invalid service ID', 'VAL_002');
  }

  // Verify service ownership
  const service = await Monitoring.findOne({
    _id: serviceId,
    owner: req.user._id,
  });

  if (!service) {
    throw new ApiError(404, 'Service not found', 'MON_001');
  }

  // Calculate time range
  const now = new Date();
  let timeRangeMs = 24 * 60 * 60 * 1000; // Default 24h

  switch (timeRange) {
    case '1h':
      timeRangeMs = 60 * 60 * 1000;
      break;
    case '7d':
      timeRangeMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '30d':
      timeRangeMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case '90d':
      timeRangeMs = 90 * 24 * 60 * 60 * 1000;
      break;
  }

  const startTime = new Date(now - timeRangeMs);

  // Build filter
  const filter = {
    monitoringId: serviceId,
    timestamp: { $gte: startTime, $lte: now },
  };

  if (location) {
    filter['location.region'] = location;
  }

  if (statusCode) {
    filter['http.statusCode'] = parseInt(statusCode);
  }

  // Get metrics
  const metrics = await PerformanceMetrics.find(filter)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  // Get total count
  const total = await PerformanceMetrics.countDocuments(filter);

  // Calculate aggregated statistics
  const stats = calculateStatistics(metrics);

  res.status(200).json(
    new ApiResponse(200, {
      service: service.name,
      timeRange,
      startTime,
      endTime: now,
      total,
      metrics,
      statistics: stats,
    })
  );
});

/**
 * Get performance trends (over time)
 * Returns hourly/daily aggregates
 */
export const getPerformanceTrends = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { granularity = 'hourly', timeRange = '24h' } = req.query;

  // Validate service ID
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, 'Invalid service ID', 'VAL_002');
  }

  // Verify service ownership
  const service = await Monitoring.findOne({
    _id: serviceId,
    owner: req.user._id,
  });

  if (!service) {
    throw new ApiError(404, 'Service not found', 'MON_001');
  }

  // Calculate time range
  const now = new Date();
  let timeRangeMs = 24 * 60 * 60 * 1000;

  if (timeRange === '7d') timeRangeMs = 7 * 24 * 60 * 60 * 1000;
  if (timeRange === '30d') timeRangeMs = 30 * 24 * 60 * 60 * 1000;

  const startTime = new Date(now - timeRangeMs);

  // Determine grouping interval
  let groupInterval;
  switch (granularity) {
    case 'hourly':
      groupInterval = 60 * 60 * 1000;
      break;
    case 'daily':
      groupInterval = 24 * 60 * 60 * 1000;
      break;
    case 'weekly':
      groupInterval = 7 * 24 * 60 * 60 * 1000;
      break;
    default:
      groupInterval = 60 * 60 * 1000;
  }

  // Aggregation pipeline for trends
  const trends = await PerformanceMetrics.aggregate([
    {
      $match: {
        monitoringId: new mongoose.Types.ObjectId(serviceId),
        timestamp: { $gte: startTime, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d %H:00',
            date: '$timestamp',
          },
        },
        avgResponseTime: { $avg: '$responseTime.mean' },
        minResponseTime: { $min: '$responseTime.min' },
        maxResponseTime: { $max: '$responseTime.max' },
        p95ResponseTime: { $avg: '$responseTime.p95' },
        successCount: {
          $sum: { $cond: ['$availability.isOnline', 1, 0] },
        },
        failureCount: {
          $sum: { $cond: ['$availability.isOnline', 0, 1] },
        },
        uptime: { $avg: '$availability.uptime' },
        count: { $sum: 1 },
        avgLCP: { $avg: '$webVitals.lcp' },
        avgFID: { $avg: '$webVitals.fid' },
        avgCLS: { $avg: '$webVitals.cls' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      service: service.name,
      granularity,
      timeRange,
      startTime,
      endTime: now,
      trends,
    })
  );
});

/**
 * Get performance comparison (current vs baseline/previous period)
 */
export const getPerformanceComparison = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { timeRange = '24h' } = req.query;

  // Validate service ID
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, 'Invalid service ID', 'VAL_002');
  }

  // Verify service ownership
  const service = await Monitoring.findOne({
    _id: serviceId,
    owner: req.user._id,
  });

  if (!service) {
    throw new ApiError(404, 'Service not found', 'MON_001');
  }

  // Calculate time ranges
  const now = new Date();
  let timeRangeMs = 24 * 60 * 60 * 1000;

  if (timeRange === '7d') timeRangeMs = 7 * 24 * 60 * 60 * 1000;
  if (timeRange === '30d') timeRangeMs = 30 * 24 * 60 * 60 * 1000;

  const currentStart = new Date(now - timeRangeMs);
  const previousStart = new Date(currentStart - timeRangeMs);

  // Get current period metrics
  const currentMetrics = await PerformanceMetrics.find({
    monitoringId: serviceId,
    timestamp: { $gte: currentStart, $lte: now },
  }).lean();

  // Get previous period metrics
  const previousMetrics = await PerformanceMetrics.find({
    monitoringId: serviceId,
    timestamp: { $gte: previousStart, $lt: currentStart },
  }).lean();

  // Calculate statistics
  const currentStats = calculateStatistics(currentMetrics);
  const previousStats = calculateStatistics(previousMetrics);

  // Calculate differences
  const comparison = {
    responseTime: {
      current: currentStats.avgResponseTime,
      previous: previousStats.avgResponseTime,
      change: ((currentStats.avgResponseTime - previousStats.avgResponseTime) / previousStats.avgResponseTime * 100).toFixed(2),
      trend: currentStats.avgResponseTime > previousStats.avgResponseTime ? 'up' : 'down',
    },
    uptime: {
      current: currentStats.uptime,
      previous: previousStats.uptime,
      change: (currentStats.uptime - previousStats.uptime).toFixed(2),
    },
    errorRate: {
      current: currentStats.errorRate,
      previous: previousStats.errorRate,
      change: ((currentStats.errorRate - previousStats.errorRate) / previousStats.errorRate * 100).toFixed(2),
    },
  };

  res.status(200).json(
    new ApiResponse(200, {
      service: service.name,
      timeRange,
      comparison,
      currentStats,
      previousStats,
    })
  );
});

/**
 * Get performance alerts/anomalies
 */
export const getPerformanceAnomalies = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { limit = 50 } = req.query;

  // Validate service ID
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, 'Invalid service ID', 'VAL_002');
  }

  // Verify service ownership
  const service = await Monitoring.findOne({
    _id: serviceId,
    owner: req.user._id,
  });

  if (!service) {
    throw new ApiError(404, 'Service not found', 'MON_001');
  }

  // Get anomalies
  const anomalies = await PerformanceMetrics.find({
    monitoringId: serviceId,
    'anomaly.isAnomaly': true,
  })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      service: service.name,
      total: anomalies.length,
      anomalies,
    })
  );
});

/**
 * Calculate statistics from metrics array
 */
function calculateStatistics(metrics) {
  if (!metrics || metrics.length === 0) {
    return {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      uptime: 100,
      errorRate: 0,
      totalChecks: 0,
      successCount: 0,
      failureCount: 0,
      avgLCP: 0,
      avgFID: 0,
      avgCLS: 0,
    };
  }

  const responseTimes = metrics.map(m => m.responseTime?.mean || 0).filter(t => t > 0);
  const upTimes = metrics.map(m => m.availability?.uptime || 0);
  const lcps = metrics.map(m => m.webVitals?.lcp || 0).filter(v => v > 0);
  const fids = metrics.map(m => m.webVitals?.fid || 0).filter(v => v > 0);
  const clss = metrics.map(m => m.webVitals?.cls || 0).filter(v => v > 0);

  const successCount = metrics.filter(m => m.availability?.isOnline).length;
  const failureCount = metrics.length - successCount;

  return {
    avgResponseTime: (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2),
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    p95ResponseTime: calculatePercentile(responseTimes, 0.95),
    uptime: (upTimes.reduce((a, b) => a + b, 0) / upTimes.length).toFixed(2),
    errorRate: ((failureCount / metrics.length) * 100).toFixed(2),
    totalChecks: metrics.length,
    successCount,
    failureCount,
    avgLCP: (lcps.reduce((a, b) => a + b, 0) / lcps.length || 0).toFixed(0),
    avgFID: (fids.reduce((a, b) => a + b, 0) / fids.length || 0).toFixed(0),
    avgCLS: (clss.reduce((a, b) => a + b, 0) / clss.length || 0).toFixed(2),
  };
}

/**
 * Calculate percentile value
 */
function calculatePercentile(arr, percentile) {
  if (!arr || arr.length === 0) return 0;

  const sorted = arr.sort((a, b) => a - b);
  const index = Math.ceil((percentile * sorted.length) - 1);

  return sorted[Math.max(0, index)];
}

export default {
  getPerformanceMetrics,
  getPerformanceTrends,
  getPerformanceComparison,
  getPerformanceAnomalies,
};
