import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import AlertRule from '../models/alertRule.model.js';
import Monitoring from '../models/monitoring.model.js';

/**
 * Alert Rule Controller
 * Handles custom alert rule creation, evaluation, and notification management
 */

/**
 * Create alert rule
 * POST /api/v1/alerts/rules
 */
const createAlertRule = asyncHandler(async (req, res) => {
  const {
    monitoringId,
    name,
    description,
    conditions,
    notificationChannels,
    escalationPolicy,
    enableAutoResolve,
    cooldownMinutes,
    tags,
  } = req.body;

  // Validate monitoring service exists
  if (monitoringId) {
    const monitoring = await Monitoring.findById(monitoringId);
    if (!monitoring) {
      throw new ApiError(404, 'Monitoring service not found');
    }
  }

  // Validate conditions
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
    throw new ApiError(400, 'At least one condition is required');
  }

  const alertRule = await AlertRule.create({
    userId: req.user._id,
    monitoringId,
    name,
    description,
    conditions,
    notifications: {
      channels: notificationChannels || ['email'],
      escalation: escalationPolicy || [],
    },
    resolution: {
      autoResolve: enableAutoResolve !== false,
      autoResolveDuration: 300, // 5 minutes default
    },
    cooldown: {
      enabled: true,
      minutes: cooldownMinutes || 5,
    },
    tags: tags || [],
    enabled: true,
    status: 'active',
  });

  return res
    .status(201)
    .json(new ApiResponse(201, alertRule, 'Alert rule created successfully'));
});

/**
 * Get alert rule by ID
 * GET /api/v1/alerts/rules/:ruleId
 */
const getAlertRule = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;

  const alertRule = await AlertRule.findById(ruleId)
    .populate(['userId', 'monitoringId']);

  if (!alertRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, alertRule, 'Alert rule retrieved successfully'));
});

/**
 * List alert rules with filters
 * GET /api/v1/alerts/rules
 */
const listAlertRules = asyncHandler(async (req, res) => {
  const {
    monitoringId,
    status = 'all',
    limit = 20,
    offset = 0,
    tags,
  } = req.query;

  let query = { userId: req.user._id };

  if (monitoringId) query.monitoringId = monitoringId;
  if (status !== 'all') query.status = status;
  if (tags) {
    const tagArray = typeof tags === 'string' ? [tags] : tags;
    query.tags = { $in: tagArray };
  }

  const alertRules = await AlertRule.find(query)
    .populate('monitoringId')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await AlertRule.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        rules: alertRules,
      },
      'Alert rules retrieved successfully'
    )
  );
});

/**
 * Update alert rule
 * PUT /api/v1/alerts/rules/:ruleId
 */
const updateAlertRule = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;
  const {
    name,
    description,
    conditions,
    notificationChannels,
    escalationPolicy,
    cooldownMinutes,
    tags,
    enabled,
  } = req.body;

  const alertRule = await AlertRule.findById(ruleId);

  if (!alertRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  if (name) alertRule.name = name;
  if (description) alertRule.description = description;
  if (conditions) alertRule.conditions = conditions;
  if (notificationChannels) alertRule.notifications.channels = notificationChannels;
  if (escalationPolicy) alertRule.notifications.escalation = escalationPolicy;
  if (cooldownMinutes !== undefined) alertRule.cooldown.minutes = cooldownMinutes;
  if (tags) alertRule.tags = tags;
  if (enabled !== undefined) alertRule.enabled = enabled;

  await alertRule.save();

  return res
    .status(200)
    .json(new ApiResponse(200, alertRule, 'Alert rule updated successfully'));
});

/**
 * Test alert rule with sample data
 * POST /api/v1/alerts/rules/:ruleId/test
 */
const testAlertRule = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;
  const { testData } = req.body;

  const alertRule = await AlertRule.findById(ruleId);

  if (!alertRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  if (!testData) {
    throw new ApiError(400, 'Test data is required');
  }

  // Evaluate conditions against test data
  const evaluationResult = evaluateConditions(
    alertRule.conditions,
    testData
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ruleId: alertRule._id,
        ruleName: alertRule.name,
        testData,
        conditionsMet: evaluationResult.conditionsMet,
        willTrigger: evaluationResult.willTrigger,
        evaluationDetails: evaluationResult.details,
      },
      'Alert rule tested successfully'
    )
  );
});

/**
 * Get alert rule execution history
 * GET /api/v1/alerts/rules/:ruleId/history
 */
const getAlertRuleHistory = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const alertRule = await AlertRule.findById(ruleId);

  if (!alertRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  const history = alertRule.executionHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(offset, offset + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ruleId,
        total: alertRule.executionHistory.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        history,
      },
      'Alert rule history retrieved successfully'
    )
  );
});

/**
 * Get triggered alerts from a rule
 * GET /api/v1/alerts/rules/:ruleId/alerts
 */
const getTriggeredAlerts = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;
  const { status = 'all', limit = 20, offset = 0 } = req.query;

  const alertRule = await AlertRule.findById(ruleId);

  if (!alertRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  let alerts = alertRule.triggeredAlerts || [];

  if (status !== 'all') {
    alerts = alerts.filter((a) => a.status === status);
  }

  const paginatedAlerts = alerts
    .sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt))
    .slice(offset, offset + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ruleId,
        total: alerts.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        alerts: paginatedAlerts,
      },
      'Triggered alerts retrieved successfully'
    )
  );
});

/**
 * Enable alert rule
 * PATCH /api/v1/alerts/rules/:ruleId/enable
 */
const enableAlertRule = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;

  const alertRule = await AlertRule.findById(ruleId);

  if (!alertRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  alertRule.enabled = true;
  alertRule.status = 'active';
  alertRule.enabledAt = new Date();
  alertRule.enabledBy = req.user._id;

  await alertRule.save();

  return res
    .status(200)
    .json(new ApiResponse(200, alertRule, 'Alert rule enabled successfully'));
});

/**
 * Disable alert rule
 * PATCH /api/v1/alerts/rules/:ruleId/disable
 */
const disableAlertRule = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;

  const alertRule = await AlertRule.findById(ruleId);

  if (!alertRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  alertRule.enabled = false;
  alertRule.status = 'inactive';
  alertRule.disabledAt = new Date();
  alertRule.disabledBy = req.user._id;

  await alertRule.save();

  return res
    .status(200)
    .json(new ApiResponse(200, alertRule, 'Alert rule disabled successfully'));
});

/**
 * Duplicate alert rule
 * POST /api/v1/alerts/rules/:ruleId/duplicate
 */
const duplicateAlertRule = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;
  const { newName } = req.body;

  const originalRule = await AlertRule.findById(ruleId);

  if (!originalRule) {
    throw new ApiError(404, 'Alert rule not found');
  }

  const duplicatedRule = await AlertRule.create({
    userId: req.user._id,
    monitoringId: originalRule.monitoringId,
    name: newName || `${originalRule.name} (Copy)`,
    description: originalRule.description,
    conditions: originalRule.conditions,
    notifications: originalRule.notifications,
    resolution: originalRule.resolution,
    cooldown: originalRule.cooldown,
    tags: originalRule.tags,
    enabled: false,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, duplicatedRule, 'Alert rule duplicated successfully')
    );
});

/**
 * Get alert rule statistics
 * GET /api/v1/alerts/rules/stats/overview
 */
const getAlertRuleStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const totalRules = await AlertRule.countDocuments({ userId: req.user._id });
  const enabledRules = await AlertRule.countDocuments({
    userId: req.user._id,
    enabled: true,
  });
  const disabledRules = await AlertRule.countDocuments({
    userId: req.user._id,
    enabled: false,
  });

  const recentlyTriggeredRules = await AlertRule.find({
    userId: req.user._id,
    'triggeredAlerts.triggeredAt': { $gte: startDate },
  });

  const stats = {
    totalRules,
    enabledRules,
    disabledRules,
    recentlyTriggered: recentlyTriggeredRules.length,
    avgAlertsPerRule:
      recentlyTriggeredRules.length > 0
        ? Math.round(
            recentlyTriggeredRules.reduce(
              (sum, r) => sum + (r.triggeredAlerts?.length || 0),
              0
            ) / recentlyTriggeredRules.length
          )
        : 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, 'Alert rule statistics retrieved successfully')
    );
});

/**
 * Delete alert rule
 * DELETE /api/v1/alerts/rules/:ruleId
 */
const deleteAlertRule = asyncHandler(async (req, res) => {
  const { ruleId } = req.params;

  const result = await AlertRule.findByIdAndDelete(ruleId);

  if (!result) {
    throw new ApiError(404, 'Alert rule not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Alert rule deleted successfully'));
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Evaluate conditions against data
 * Supports AND, OR, NOT, and CUSTOM logic gates
 */
function evaluateConditions(conditions, data) {
  let allConditionsMet = true;
  const details = [];

  for (const condition of conditions) {
    let conditionMet = false;

    if (condition.type === 'threshold') {
      const value = getValue(data, condition.metric);
      conditionMet = compareValues(value, condition.operator, condition.threshold);
      details.push({
        metric: condition.metric,
        operator: condition.operator,
        threshold: condition.threshold,
        actual: value,
        met: conditionMet,
      });
    } else if (condition.type === 'anomaly') {
      // Placeholder for anomaly detection
      conditionMet = false;
    } else if (condition.type === 'composite') {
      const subResults = evaluateConditions(condition.conditions || [], data);
      if (condition.logic === 'AND') {
        conditionMet = subResults.conditionsMet;
      } else if (condition.logic === 'OR') {
        conditionMet = true; // At least one
      } else if (condition.logic === 'NOT') {
        conditionMet = !subResults.conditionsMet;
      }
      details.push({
        logic: condition.logic,
        met: conditionMet,
        subConditions: subResults.details,
      });
    }

    if (!conditionMet) {
      allConditionsMet = false;
    }
  }

  return {
    conditionsMet: allConditionsMet,
    willTrigger: allConditionsMet,
    details,
  };
}

/**
 * Get nested value from data object
 */
function getValue(data, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], data);
}

/**
 * Compare two values based on operator
 */
function compareValues(actual, operator, threshold) {
  switch (operator) {
    case 'gt':
      return actual > threshold;
    case 'gte':
      return actual >= threshold;
    case 'lt':
      return actual < threshold;
    case 'lte':
      return actual <= threshold;
    case 'eq':
      return actual === threshold;
    case 'ne':
      return actual !== threshold;
    case 'contains':
      return String(actual).includes(String(threshold));
    default:
      return false;
  }
}

export {
  createAlertRule,
  getAlertRule,
  listAlertRules,
  updateAlertRule,
  testAlertRule,
  getAlertRuleHistory,
  getTriggeredAlerts,
  enableAlertRule,
  disableAlertRule,
  duplicateAlertRule,
  getAlertRuleStats,
  deleteAlertRule,
};
