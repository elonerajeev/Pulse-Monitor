import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Monitoring from '../models/monitoring.model.js';
import SLAConfiguration from '../models/slaConfiguration.model.js';

/**
 * SLA Configuration Controller
 * Handles SLA targets, breach tracking, credits/penalties, and reporting
 */

/**
 * Create SLA configuration for a service
 * POST /api/v1/monitoring/:serviceId/sla
 */
const createSLAConfiguration = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const {
    uptimeTarget,
    responseTimeTarget,
    errorRateTarget,
    monthlyCredits,
    creditDetails,
    billingCycle,
    notifications,
  } = req.body;

  // Validate service exists
  const monitoring = await Monitoring.findById(serviceId);
  if (!monitoring) {
    throw new ApiError(404, 'Monitoring service not found');
  }

  // Check if SLA already exists
  let sla = await SLAConfiguration.findOne({ monitoringId: serviceId });
  if (sla) {
    throw new ApiError(409, 'SLA configuration already exists for this service');
  }

  sla = await SLAConfiguration.create({
    monitoringId: serviceId,
    userId: req.user._id,
    targets: {
      uptime: uptimeTarget || 99.9,
      responseTime: responseTimeTarget || 200,
      errorRate: errorRateTarget || 0.1,
    },
    credits: {
      monthlyAllocation: monthlyCredits || 0,
      details: creditDetails || [],
    },
    billingCycle: billingCycle || 'monthly',
    notifications: notifications || {
      enableWarnings: true,
      warningThreshold: 95,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, sla, 'SLA configuration created successfully'));
});

/**
 * Get SLA configuration
 * GET /api/v1/monitoring/:serviceId/sla
 */
const getSLAConfiguration = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const sla = await SLAConfiguration.findOne({
    monitoringId: serviceId,
  }).populate('monitoringId');

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sla, 'SLA configuration retrieved successfully'));
});

/**
 * Get current SLA metrics and performance
 * GET /api/v1/monitoring/:serviceId/sla/metrics
 */
const getSLAMetrics = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { period = 'current_month' } = req.query;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  // Calculate current performance
  const currentMetrics = sla.currentMetrics || {};
  const targets = sla.targets;

  // Determine breach status
  const breaches = {
    uptime:
      currentMetrics.uptime !== undefined
        ? currentMetrics.uptime < targets.uptime
        : false,
    responseTime:
      currentMetrics.avgResponseTime !== undefined
        ? currentMetrics.avgResponseTime > targets.responseTime
        : false,
    errorRate:
      currentMetrics.errorRate !== undefined
        ? currentMetrics.errorRate > targets.errorRate
        : false,
  };

  const anyBreach = Object.values(breaches).some((b) => b);

  // Calculate credit eligibility
  const creditsEarned = anyBreach
    ? sla.credits.details.find((c) => c.condition.type === 'uptime_breach')
        ?.creditAmount || 0
    : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        targets,
        currentMetrics,
        breaches,
        anyBreach,
        creditsEarned,
        creditsUsed: sla.credits.usedAmount || 0,
        creditsRemaining:
          (sla.credits.monthlyAllocation || 0) - (sla.credits.usedAmount || 0),
        period,
      },
      'SLA metrics retrieved successfully'
    )
  );
});

/**
 * Get SLA history and breaches
 * GET /api/v1/monitoring/:serviceId/sla/history
 */
const getSLAHistory = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { limit = 30, offset = 0 } = req.query;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  const history = sla.breachHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(offset, offset + limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: sla.breachHistory.length,
        limit,
        offset,
        history,
      },
      'SLA breach history retrieved successfully'
    )
  );
});

/**
 * Update SLA targets
 * PUT /api/v1/monitoring/:serviceId/sla/targets
 */
const updateSLATargets = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { uptimeTarget, responseTimeTarget, errorRateTarget } = req.body;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  if (uptimeTarget !== undefined) {
    if (uptimeTarget < 90 || uptimeTarget > 100) {
      throw new ApiError(400, 'Uptime target must be between 90 and 100');
    }
    sla.targets.uptime = uptimeTarget;
  }

  if (responseTimeTarget !== undefined) {
    if (responseTimeTarget < 50 || responseTimeTarget > 10000) {
      throw new ApiError(400, 'Response time target must be between 50ms and 10000ms');
    }
    sla.targets.responseTime = responseTimeTarget;
  }

  if (errorRateTarget !== undefined) {
    if (errorRateTarget < 0 || errorRateTarget > 5) {
      throw new ApiError(400, 'Error rate target must be between 0 and 5 percent');
    }
    sla.targets.errorRate = errorRateTarget;
  }

  await sla.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, sla.targets, 'SLA targets updated successfully')
    );
});

/**
 * Configure credit rules
 * PUT /api/v1/monitoring/:serviceId/sla/credits
 */
const configureSLACredits = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { monthlyAllocation, creditDetails } = req.body;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  if (monthlyAllocation !== undefined) {
    if (monthlyAllocation < 0) {
      throw new ApiError(400, 'Monthly allocation cannot be negative');
    }
    sla.credits.monthlyAllocation = monthlyAllocation;
  }

  if (creditDetails && Array.isArray(creditDetails)) {
    sla.credits.details = creditDetails;
  }

  await sla.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, sla.credits, 'SLA credits configured successfully')
    );
});

/**
 * Record SLA breach
 * POST /api/v1/monitoring/:serviceId/sla/breaches
 */
const recordSLABreach = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { breachType, severity, details, creditsApplied } = req.body;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  // Add to breach history
  sla.breachHistory.push({
    type: breachType,
    severity: severity || 'medium',
    details,
    creditsApplied: creditsApplied || 0,
    timestamp: new Date(),
    acknowledged: false,
  });

  // Update used credits
  sla.credits.usedAmount = (sla.credits.usedAmount || 0) + (creditsApplied || 0);

  // Check if breach threshold crossed for notifications
  if (sla.notifications.enableWarnings) {
    const recentBreaches = sla.breachHistory.filter(
      (b) => new Date() - new Date(b.timestamp) <= 86400000
    ).length; // Last 24 hours

    if (recentBreaches >= 3) {
      sla.lastBreachNotificationAt = new Date();
    }
  }

  await sla.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        breach: sla.breachHistory[sla.breachHistory.length - 1],
        creditsUsed: sla.credits.usedAmount,
        creditsRemaining:
          (sla.credits.monthlyAllocation || 0) - (sla.credits.usedAmount || 0),
      },
      'SLA breach recorded successfully'
    )
  );
});

/**
 * Get SLA report for a period
 * GET /api/v1/monitoring/:serviceId/sla/report
 */
const getSLAReport = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { startDate, endDate } = req.query;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  const start = new Date(startDate) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = new Date(endDate) || new Date();

  // Filter breaches in date range
  const breachesInRange = sla.breachHistory.filter(
    (b) => new Date(b.timestamp) >= start && new Date(b.timestamp) <= end
  );

  // Categorize breaches
  const breachSummary = {
    total: breachesInRange.length,
    byType: {},
    bySeverity: {},
  };

  breachesInRange.forEach((b) => {
    breachSummary.byType[b.type] = (breachSummary.byType[b.type] || 0) + 1;
    breachSummary.bySeverity[b.severity] = (breachSummary.bySeverity[b.severity] || 0) + 1;
  });

  // Calculate compliance percentage
  const reportingPeriodDays = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
  const compliancePercentage = ((reportingPeriodDays - breachesInRange.length) / reportingPeriodDays) * 100;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        period: {
          start,
          end,
          days: reportingPeriodDays,
        },
        targets: sla.targets,
        performance: sla.currentMetrics,
        breachSummary,
        compliancePercentage: Math.round(compliancePercentage * 100) / 100,
        creditsEarned: breachesInRange.reduce((sum, b) => sum + (b.creditsApplied || 0), 0),
        breaches: breachesInRange,
      },
      'SLA report generated successfully'
    )
  );
});

/**
 * Get SLA notification settings
 * GET /api/v1/monitoring/:serviceId/sla/notifications
 */
const getSLANotifications = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sla.notifications,
        'SLA notification settings retrieved'
      )
    );
});

/**
 * Update SLA notification settings
 * PUT /api/v1/monitoring/:serviceId/sla/notifications
 */
const updateSLANotifications = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { enableWarnings, warningThreshold, notificationChannels } = req.body;

  const sla = await SLAConfiguration.findOne({ monitoringId: serviceId });

  if (!sla) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  if (enableWarnings !== undefined) sla.notifications.enableWarnings = enableWarnings;
  if (warningThreshold !== undefined) sla.notifications.warningThreshold = warningThreshold;
  if (notificationChannels) sla.notifications.channels = notificationChannels;

  await sla.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sla.notifications,
        'SLA notification settings updated'
      )
    );
});

/**
 * Delete SLA configuration
 * DELETE /api/v1/monitoring/:serviceId/sla
 */
const deleteSLAConfiguration = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const result = await SLAConfiguration.findOneAndDelete({ monitoringId: serviceId });

  if (!result) {
    throw new ApiError(404, 'SLA configuration not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, 'SLA configuration deleted successfully')
    );
});

export {
  createSLAConfiguration,
  getSLAConfiguration,
  getSLAMetrics,
  getSLAHistory,
  updateSLATargets,
  configureSLACredits,
  recordSLABreach,
  getSLAReport,
  getSLANotifications,
  updateSLANotifications,
  deleteSLAConfiguration,
};
