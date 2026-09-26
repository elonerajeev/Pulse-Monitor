import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Monitoring from '../models/monitoring.model.js';
import MultiRegionMonitoring from '../models/multiRegionMonitoring.model.js';
import User from '../models/user.model.js';

/**
 * Multi-Region Monitoring Controller
 * Handles monitoring across global regions with failover, regional alerts, and performance baselines
 */

/**
 * Create multi-region monitoring configuration for a service
 * POST /api/v1/monitoring/:serviceId/multi-region
 */
const createMultiRegionConfig = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { regions, enableFailover, failoverStrategy, regionWeights } = req.body;

  // Validate service exists
  const monitoring = await Monitoring.findById(serviceId);
  if (!monitoring) {
    throw new ApiError(404, 'Monitoring service not found');
  }

  // Validate regions
  const validRegions = [
    'us-east-1',
    'us-west-2',
    'eu-west-1',
    'eu-central-1',
    'ap-southeast-1',
    'ap-northeast-1',
    'ap-south-1',
    'sa-east-1',
    'ca-central-1',
    'au-southeast-1',
    'me-south-1',
  ];

  const invalidRegions = regions.filter((r) => !validRegions.includes(r));
  if (invalidRegions.length > 0) {
    throw new ApiError(400, `Invalid regions: ${invalidRegions.join(', ')}`);
  }

  // Check if config already exists
  let config = await MultiRegionMonitoring.findOne({ monitoringId: serviceId });
  if (config) {
    throw new ApiError(409, 'Multi-region config already exists for this service');
  }

  config = await MultiRegionMonitoring.create({
    monitoringId: serviceId,
    userId: req.user._id,
    regions: regions.map((r) => ({
      name: r,
      enabled: true,
      status: 'checking',
    })),
    failover: {
      enabled: enableFailover || false,
      strategy: failoverStrategy || 'fastest',
      regionWeights: regionWeights || {},
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        config,
        'Multi-region monitoring configuration created successfully'
      )
    );
});

/**
 * Get multi-region configuration for a service
 * GET /api/v1/monitoring/:serviceId/multi-region
 */
const getMultiRegionConfig = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const config = await MultiRegionMonitoring.findOne({
    monitoringId: serviceId,
  }).populate('monitoringId');

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, config, 'Multi-region configuration retrieved'));
});

/**
 * Get regional health status dashboard
 * GET /api/v1/monitoring/:serviceId/multi-region/health
 */
const getRegionalHealth = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const config = await MultiRegionMonitoring.findOne({
    monitoringId: serviceId,
  });

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  // Calculate regional statistics
  const regionalStats = config.regions.map((region) => {
    const latestData = region.performanceBaseline[region.performanceBaseline.length - 1] || {};
    const alerts = config.regionalAlerts.filter((a) => a.affectedRegions.includes(region.name));

    return {
      name: region.name,
      status: region.status,
      uptime: region.uptime,
      lastCheckedAt: region.lastCheckedAt,
      activeAlerts: alerts.length,
      averageResponseTime: latestData.avgResponseTime || 0,
      failureRate: latestData.failureRate || 0,
      consecutiveFailures: region.consecutiveFailures,
    };
  });

  // Overall health
  const activeRegions = config.regions.filter((r) => r.status === 'healthy').length;
  const overallHealth = {
    totalRegions: config.regions.length,
    healthyRegions: activeRegions,
    failedRegions: config.regions.length - activeRegions,
    healthPercentage: (activeRegions / config.regions.length) * 100,
    primaryRegion: config.failover.primaryRegion,
    failoverEnabled: config.failover.enabled,
    lastFailoverAt: config.failover.lastFailoverAt,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overallHealth,
        regionalStats,
        failoverStrategy: config.failover.strategy,
      },
      'Regional health status retrieved'
    )
  );
});

/**
 * Get regional performance comparison
 * GET /api/v1/monitoring/:serviceId/multi-region/performance
 */
const getRegionalPerformance = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { timeRange = '24h' } = req.query;

  const config = await MultiRegionMonitoring.findOne({
    monitoringId: serviceId,
  });

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  // Aggregate performance metrics per region
  const timeRangeMs = {
    '1h': 3600000,
    '24h': 86400000,
    '7d': 604800000,
    '30d': 2592000000,
  }[timeRange] || 86400000;

  const performanceData = config.regions.map((region) => {
    const recentData = region.performanceBaseline.filter(
      (d) => new Date() - new Date(d.timestamp) <= timeRangeMs
    );

    const avgResponseTime =
      recentData.reduce((sum, d) => sum + (d.avgResponseTime || 0), 0) / recentData.length || 0;
    const avgFailureRate =
      recentData.reduce((sum, d) => sum + (d.failureRate || 0), 0) / recentData.length || 0;
    const avgThroughput =
      recentData.reduce((sum, d) => sum + (d.throughput || 0), 0) / recentData.length || 0;

    return {
      region: region.name,
      avgResponseTime: Math.round(avgResponseTime),
      avgFailureRate: Math.round(avgFailureRate * 100) / 100,
      avgThroughput,
      p95ResponseTime: Math.max(
        ...recentData.map((d) => d.p95ResponseTime || 0)
      ),
      p99ResponseTime: Math.max(
        ...recentData.map((d) => d.p99ResponseTime || 0)
      ),
      dataPoints: recentData.length,
    };
  });

  const bestPerforming = performanceData.reduce((best, current) =>
    current.avgResponseTime < best.avgResponseTime ? current : best
  );

  const worstPerforming = performanceData.reduce((worst, current) =>
    current.avgResponseTime > worst.avgResponseTime ? current : worst
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        timeRange,
        performanceData,
        bestPerforming,
        worstPerforming,
        timestamp: new Date(),
      },
      'Regional performance metrics retrieved'
    )
  );
});

/**
 * Get regional alerts
 * GET /api/v1/monitoring/:serviceId/multi-region/alerts
 */
const getRegionalAlerts = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { status = 'all', region } = req.query;

  let query = { monitoringId: serviceId };
  if (region) {
    query = { ...query, 'regionalAlerts.affectedRegions': region };
  }

  const config = await MultiRegionMonitoring.findOne(query);

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  let alerts = config.regionalAlerts;

  if (status !== 'all') {
    alerts = alerts.filter((a) => a.status === status);
  }

  if (region) {
    alerts = alerts.filter((a) => a.affectedRegions.includes(region));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalAlerts: alerts.length,
        alerts: alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      },
      'Regional alerts retrieved'
    )
  );
});

/**
 * Update region configuration
 * PUT /api/v1/monitoring/:serviceId/multi-region/regions/:regionName
 */
const updateRegionConfig = asyncHandler(async (req, res) => {
  const { serviceId, regionName } = req.params;
  const { enabled, alertThreshold } = req.body;

  const config = await MultiRegionMonitoring.findOne({ monitoringId: serviceId });

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  const region = config.regions.find((r) => r.name === regionName);
  if (!region) {
    throw new ApiError(404, `Region ${regionName} not found`);
  }

  if (enabled !== undefined) region.enabled = enabled;
  if (alertThreshold !== undefined) region.alertThreshold = alertThreshold;

  await config.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, config, 'Region configuration updated successfully')
    );
});

/**
 * Configure failover strategy
 * PUT /api/v1/monitoring/:serviceId/multi-region/failover
 */
const configureFailover = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { enabled, strategy, primaryRegion, regionWeights } = req.body;

  const config = await MultiRegionMonitoring.findOne({ monitoringId: serviceId });

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  if (enabled !== undefined) config.failover.enabled = enabled;
  if (strategy) config.failover.strategy = strategy;
  if (primaryRegion) {
    const regionExists = config.regions.some((r) => r.name === primaryRegion);
    if (!regionExists) {
      throw new ApiError(400, 'Primary region not found in configuration');
    }
    config.failover.primaryRegion = primaryRegion;
  }
  if (regionWeights) config.failover.regionWeights = regionWeights;

  await config.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        config.failover,
        'Failover strategy configured successfully'
      )
    );
});

/**
 * Trigger manual failover
 * POST /api/v1/monitoring/:serviceId/multi-region/failover/trigger
 */
const triggerFailover = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { targetRegion, reason } = req.body;

  const config = await MultiRegionMonitoring.findOne({ monitoringId: serviceId });

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  if (!config.failover.enabled) {
    throw new ApiError(400, 'Failover is not enabled for this service');
  }

  const targetRegionObj = config.regions.find((r) => r.name === targetRegion);
  if (!targetRegionObj) {
    throw new ApiError(400, 'Target region not found');
  }

  config.failover.lastFailoverAt = new Date();
  config.failover.primaryRegion = targetRegion;

  // Record failover event
  config.failoverHistory.push({
    from: config.failover.primaryRegion,
    to: targetRegion,
    reason: reason || 'Manual failover',
    triggeredBy: req.user._id,
    timestamp: new Date(),
  });

  await config.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        failover: config.failover,
        timestamp: new Date(),
      },
      'Failover triggered successfully'
    )
  );
});

/**
 * Get failover history
 * GET /api/v1/monitoring/:serviceId/multi-region/failover/history
 */
const getFailoverHistory = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { limit = 20 } = req.query;

  const config = await MultiRegionMonitoring.findOne({ monitoringId: serviceId });

  if (!config) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  const history = config.failoverHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalFailovers: config.failoverHistory.length,
        history,
      },
      'Failover history retrieved'
    )
  );
});

/**
 * Delete multi-region configuration
 * DELETE /api/v1/monitoring/:serviceId/multi-region
 */
const deleteMultiRegionConfig = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const result = await MultiRegionMonitoring.findOneAndDelete({
    monitoringId: serviceId,
  });

  if (!result) {
    throw new ApiError(404, 'Multi-region configuration not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, 'Multi-region configuration deleted successfully')
    );
});

export {
  createMultiRegionConfig,
  getMultiRegionConfig,
  getRegionalHealth,
  getRegionalPerformance,
  getRegionalAlerts,
  updateRegionConfig,
  configureFailover,
  triggerFailover,
  getFailoverHistory,
  deleteMultiRegionConfig,
};
