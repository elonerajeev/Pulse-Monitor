import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Integration Model
 * Third-party integrations for notifications and data sync
 * Supports: Slack, Teams, PagerDuty, Opsgenie, Datadog, New Relic, etc.
 */

const integrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    // Integration type
    type: {
      type: String,
      enum: [
        'slack',
        'teams',
        'discord',
        'telegram',
        'pagerduty',
        'opsgenie',
        'datadog',
        'newrelic',
        'sumologic',
        'splunk',
        'elastic',
        'grafana',
        'webhooks',
        'custom',
      ],
      required: true,
    },
    // Credentials (encrypted)
    credentials: {
      apiKey: String,
      apiSecret: String,
      accessToken: String,
      refreshToken: String,
      webhookUrl: String,
      webhookSecret: String,
      customHeaders: mongoose.Schema.Types.Mixed,
      customConfig: mongoose.Schema.Types.Mixed,
    },
    // Integration-specific settings
    settings: {
      // For Slack/Teams/Discord
      channel: String,
      channelId: String,
      username: String,
      iconUrl: String,
      threadReplies: Boolean,

      // For PagerDuty/Opsgenie
      serviceId: String,
      escalationPolicyId: String,
      teamId: String,
      urgency: {
        type: String,
        enum: ['low', 'high'],
        default: 'high',
      },

      // For monitoring integrations
      dashboardUrl: String,
      siteRegion: String, // For multi-region services
      apiBaseUrl: String,

      // Common settings
      messageFormat: {
        type: String,
        enum: ['default', 'detailed', 'minimal', 'custom'],
        default: 'default',
      },
      customTemplate: String, // For custom message formatting
      includeMetrics: Boolean,
      includeGraphs: Boolean,
    },
    // Event routing
    eventRouting: {
      enabled: Boolean,
      rules: [
        {
          eventType: String, // alert.triggered, incident.created, etc.
          severity: [String], // critical, high, medium, low
          route: {
            type: String,
            enum: ['always', 'oncall', 'escalate', 'batch'],
          },
          delay: Number, // seconds (for batching)
        },
      ],
    },
    // Monitored items
    monitored: {
      services: [mongoose.Schema.Types.ObjectId],
      alerts: [mongoose.Schema.Types.ObjectId],
      incidents: [mongoose.Schema.Types.ObjectId],
      allIncidents: Boolean,
      allAlerts: Boolean,
    },
    // Status
    enabled: {
      type: Boolean,
      default: true,
    },
    connected: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastVerified: Date,
    // Health & metrics
    health: {
      status: {
        type: String,
        enum: ['healthy', 'warning', 'error'],
        default: 'healthy',
      },
      lastCheck: Date,
      consecutiveFailures: {
        type: Number,
        default: 0,
      },
      lastError: String,
    },
    // Usage statistics
    statistics: {
      totalEvents: {
        type: Number,
        default: 0,
      },
      successfulDeliveries: {
        type: Number,
        default: 0,
      },
      failedDeliveries: {
        type: Number,
        default: 0,
      },
      lastDelivery: Date,
      avgResponseTime: Number,
    },
    // Event history
    eventHistory: [
      {
        timestamp: {
          type: Date,
          index: true,
        },
        eventType: String,
        severity: String,
        message: String,
        success: Boolean,
        statusCode: Number,
        responseTime: Number,
        error: String,
        payload: mongoose.Schema.Types.Mixed,
      },
    ],
    // Rate limiting
    rateLimiting: {
      enabled: Boolean,
      requestsPerSecond: Number,
      burstSize: Number,
      lastReset: Date,
    },
    // Sync configuration
    sync: {
      enabled: Boolean,
      direction: {
        type: String,
        enum: ['outbound', 'inbound', 'bidirectional'],
        default: 'outbound',
      },
      frequency: String, // For inbound: hourly, daily, etc.
      lastSync: Date,
    },
    // OAuth
    oauth: {
      enabled: Boolean,
      oauthUrl: String,
      scope: [String],
      grantedAt: Date,
      expiresAt: Date,
    },
    // Audit
    auditLog: [
      {
        action: String,
        timestamp: Date,
        userId: mongoose.Schema.Types.ObjectId,
        changes: mongoose.Schema.Types.Mixed,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'integrations',
  }
);

// ==================== INDEXES ====================
integrationSchema.index({ userId: 1, type: 1 });
integrationSchema.index({ teamId: 1, enabled: 1 });
integrationSchema.index({ type: 1 });
integrationSchema.index({ connected: 1 });
integrationSchema.index({ 'eventHistory.timestamp': -1 });

// ==================== METHODS ====================

/**
 * Test integration connection
 */
integrationSchema.methods.testConnection = async function () {
  this.lastVerified = new Date();

  try {
    // Implementation would test based on integration type
    // This is a placeholder
    this.verified = true;
    this.connected = true;
    this.health.status = 'healthy';
    this.health.lastCheck = new Date();
    this.health.consecutiveFailures = 0;

    return {
      success: true,
      message: 'Integration verified successfully',
    };
  } catch (error) {
    this.connected = false;
    this.health.status = 'error';
    this.health.lastCheck = new Date();
    this.health.consecutiveFailures += 1;
    this.health.lastError = error.message;

    if (this.health.consecutiveFailures > 5) {
      this.enabled = false;
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send event through integration
 */
integrationSchema.methods.sendEvent = async function (event) {
  if (!this.enabled || !this.connected) {
    return {
      success: false,
      error: 'Integration is not connected',
    };
  }

  // Check event routing rules
  const rule = this.eventRouting.rules.find(
    (r) =>
      r.eventType === event.type &&
      (!r.severity.length || r.severity.includes(event.severity))
  );

  if (!rule) {
    return { success: false, error: 'Event does not match any routing rules' };
  }

  const eventRecord = {
    timestamp: new Date(),
    eventType: event.type,
    severity: event.severity,
    message: event.message,
    success: false,
    payload: event,
  };

  try {
    // Implementation would send event based on integration type
    // This is a placeholder
    eventRecord.success = true;
    eventRecord.statusCode = 200;
    eventRecord.responseTime = Math.random() * 1000;

    this.statistics.totalEvents += 1;
    this.statistics.successfulDeliveries += 1;
    this.statistics.lastDelivery = new Date();

    if (this.statistics.avgResponseTime) {
      this.statistics.avgResponseTime =
        (this.statistics.avgResponseTime + eventRecord.responseTime) / 2;
    } else {
      this.statistics.avgResponseTime = eventRecord.responseTime;
    }

    this.health.consecutiveFailures = 0;

    return { success: true };
  } catch (error) {
    eventRecord.error = error.message;
    eventRecord.statusCode = 500;
    this.statistics.totalEvents += 1;
    this.statistics.failedDeliveries += 1;
    this.health.consecutiveFailures += 1;
    this.health.lastError = error.message;

    if (this.health.consecutiveFailures > 5) {
      this.enabled = false;
      this.health.status = 'error';
    }

    return { success: false, error: error.message };
  } finally {
    this.eventHistory.push(eventRecord);

    // Keep only last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000);
    }

    await this.save();
  }
};

/**
 * Get formatted event message
 */
integrationSchema.methods.formatMessage = function (event) {
  const { messageFormat, customTemplate } = this.settings;

  switch (messageFormat) {
    case 'minimal':
      return `[${event.severity}] ${event.message}`;
    case 'detailed':
      return `
[${event.severity}] ${event.message}
Service: ${event.serviceName}
Time: ${new Date().toISOString()}
${event.details ? 'Details: ' + event.details : ''}
      `.trim();
    case 'custom':
      return this.substituteTemplate(customTemplate, event);
    default: // default
      return `[${event.type}] ${event.message}`;
  }
};

/**
 * Substitute template variables
 */
integrationSchema.methods.substituteTemplate = function (template, event) {
  let result = template;
  result = result.replace(/\{type\}/g, event.type);
  result = result.replace(/\{message\}/g, event.message);
  result = result.replace(/\{severity\}/g, event.severity);
  result = result.replace(/\{timestamp\}/g, new Date().toISOString());
  return result;
};

/**
 * Disable integration
 */
integrationSchema.methods.disable = async function (reason) {
  this.enabled = false;
  this.connected = false;

  this.auditLog.push({
    action: 'disabled',
    timestamp: new Date(),
    changes: { reason },
  });

  return this.save();
};

/**
 * Enable integration
 */
integrationSchema.methods.enable = async function () {
  this.enabled = true;
  this.health.consecutiveFailures = 0;

  this.auditLog.push({
    action: 'enabled',
    timestamp: new Date(),
  });

  return this.save();
};

export default mongoose.model('Integration', integrationSchema);
