/**
 * Alert Rule Model
 * Defines complex alert conditions with AND/OR/NOT logic
 */

import mongoose from 'mongoose';

const alertRuleSchema = new mongoose.Schema(
  {
    // Reference to monitoring service
    monitoringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitoring',
      required: true,
    },

    // User who owns this service
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Rule information
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },

    description: String,

    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Rule priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high',
    },

    // Conditions (supports complex logic)
    conditions: [
      {
        id: { type: String, required: true }, // Unique condition ID
        metric: {
          type: String,
          enum: [
            'responseTime',
            'errorRate',
            'uptime',
            'statusCode',
            'certificateExpiry',
            'ssl',
            'customMetric',
          ],
          required: true,
        },
        operator: {
          type: String,
          enum: ['>', '<', '>=', '<=', '==', '!=', 'contains', 'matches'],
          required: true,
        },
        value: mongoose.Schema.Types.Mixed,
        duration: {
          value: { type: Number, default: 5 }, // minutes
          operator: { type: String, enum: ['for', 'at_least'] },
        },
        region: String, // Optional: specific region
      },
    ],

    // Logic for combining conditions
    logic: {
      type: String,
      enum: ['AND', 'OR', 'CUSTOM'],
      default: 'AND',
      description:
        'AND: all conditions must be true, OR: any condition is true, CUSTOM: use logicExpression',
    },

    // Custom logic expression (e.g., "(A OR B) AND NOT C")
    logicExpression: String,

    // Threshold settings
    thresholds: {
      evaluationFrequency: { type: Number, default: 60 }, // seconds
      dataPoints: { type: Number, default: 2 }, // number of data points to evaluate
      breachCount: { type: Number, default: 1 }, // consecutive breaches before alert
    },

    // Time-based rules
    timeBasedRules: {
      enabled: { type: Boolean, default: false },
      timezone: { type: String, default: 'UTC' },
      businessHoursOnly: { type: Boolean, default: false },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: String, // HH:MM
        end: String, // HH:MM
      },
      daysOfWeek: [Number], // 0-6 (0=Sunday)
      excludeDates: [Date],
    },

    // Cooldown period (prevent alert spam)
    cooldown: {
      enabled: { type: Boolean, default: true },
      duration: { type: Number, default: 300 }, // seconds
      allowManualTrigger: { type: Boolean, default: true },
    },

    // Escalation policy
    escalation: {
      enabled: { type: Boolean, default: false },
      levels: [
        {
          level: Number,
          delayMinutes: Number,
          channels: [String],
          recipients: [String],
        },
      ],
    },

    // Notification configuration
    notifications: {
      channels: {
        email: { enabled: Boolean, recipients: [String] },
        slack: { enabled: Boolean, webhook: String },
        discord: { enabled: Boolean, webhook: String },
        sms: { enabled: Boolean, recipients: [String] },
        webhook: { enabled: Boolean, url: String },
        pagerduty: { enabled: Boolean, integrationKey: String },
      },
      messageTemplate: String,
      includeMetrics: { type: Boolean, default: true },
      includeRunbook: { type: Boolean, default: true },
    },

    // Actions to take when alert triggers
    actions: [
      {
        type: String,
        enum: ['notify', 'create_incident', 'create_ticket', 'webhook', 'custom'],
        configuration: mongoose.Schema.Types.Mixed,
      },
    ],

    // Alert suppression rules
    suppression: {
      enabled: { type: Boolean, default: false },
      reason: String,
      untilDate: Date,
      suppressionReason: String, // 'maintenance', 'known_issue', etc.
    },

    // Statistics
    statistics: {
      totalTriggered: { type: Number, default: 0 },
      lastTriggered: Date,
      triggerCount30Days: { type: Number, default: 0 },
      falsePositiveRate: { type: Number, default: 0 }, // percentage
    },

    // Related information
    runbook: String, // URL to runbook
    documentation: String, // URL to docs
    relatedRules: [mongoose.Schema.Types.ObjectId],

    // Rule testing
    testing: {
      enabled: { type: Boolean, default: false },
      testMode: { type: Boolean, default: false },
      lastTestTime: Date,
      testResults: mongoose.Schema.Types.Mixed,
    },

    // Metadata
    metadata: {
      createdBy: mongoose.Schema.Types.ObjectId,
      lastModifiedBy: mongoose.Schema.Types.ObjectId,
      version: { type: Number, default: 1 },
      tags: [String],
    },
  },
  {
    timestamps: true,
    collection: 'alertRules',
  }
);

// Indexes
alertRuleSchema.index({ monitoringId: 1, enabled: 1 });
alertRuleSchema.index({ userId: 1, enabled: 1 });
alertRuleSchema.index({ enabled: 1 });
alertRuleSchema.index({ priority: 1 });

const AlertRule = mongoose.model('AlertRule', alertRuleSchema);

export default AlertRule;
