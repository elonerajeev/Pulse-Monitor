/**
 * SLA Configuration Model
 * Defines SLA targets and tracks compliance
 */

import mongoose from 'mongoose';

const slaConfigurationSchema = new mongoose.Schema(
  {
    // Reference to monitoring service
    monitoringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitoring',
      required: true,
      unique: true,
    },

    // SLA name and description
    name: {
      type: String,
      required: true,
      default: 'Standard SLA',
    },
    description: String,

    // SLA targets
    targets: {
      // Uptime target (percentage)
      uptime: {
        monthly: { type: Number, default: 99.9 },
        quarterly: { type: Number, default: 99.9 },
        yearly: { type: Number, default: 99.9 },
      },

      // Response time targets
      responseTime: {
        p50: { type: Number, default: 100 }, // milliseconds
        p95: { type: Number, default: 500 },
        p99: { type: Number, default: 1000 },
      },

      // Error rate target (percentage)
      errorRate: { type: Number, default: 0.5 },

      // Availability targets
      availability: {
        weeklyDowntime: { type: Number, default: 50.4 }, // minutes
        monthlyDowntime: { type: Number, default: 216 }, // minutes
      },
    },

    // SLA breach definitions
    breaches: [
      {
        type: String,
        enum: ['uptime', 'responseTime', 'errorRate', 'availability'],
      },
    ],

    // SLA credits/penalties
    credits: [
      {
        uptimeBreach: {
          min: { type: Number, default: 99 }, // percentage
          max: { type: Number, default: 99.9 },
          credit: { type: Number, default: 10 }, // percentage of monthly fee
        },
        responseTimeBreach: {
          threshold: { type: Number, default: 1000 }, // ms
          credit: { type: Number, default: 5 },
        },
        errorRateBreach: {
          threshold: { type: Number, default: 1 }, // percentage
          credit: { type: Number, default: 15 },
        },
      },
    ],

    // Reporting configuration
    reporting: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
        default: 'monthly',
      },
      recipients: [String], // Email addresses
      includeMetrics: [String],
      includeIncidents: { type: Boolean, default: true },
      includeCredits: { type: Boolean, default: true },
    },

    // SLA periods
    periods: [
      {
        startDate: Date,
        endDate: Date,
        actualUptime: Number,
        targetUptime: Number,
        breached: Boolean,
        creditIssued: Number,
        incidents: Number,
      },
    ],

    // Current SLA status
    currentStatus: {
      calculatedUptime: Number,
      targetUptime: Number,
      onTrack: Boolean,
      daysRemaining: Number,
      projectedCredit: Number,
      lastCalculated: Date,
    },

    // Historical SLA data
    history: [
      {
        period: String, // 'Jan-2024', etc.
        uptime: Number,
        target: Number,
        breached: Boolean,
        creditIssued: Number,
        incidents: Number,
      },
    ],

    // Exclusions
    exclusions: {
      maintenanceWindows: { type: Boolean, default: true },
      customerMistakes: { type: Boolean, default: true },
      thirdPartyOutages: { type: Boolean, default: true },
      forceOfNature: { type: Boolean, default: true },
      excludedDates: [Date],
    },

    // Notifications
    notifications: {
      onBreach: { type: Boolean, default: true },
      onProjectedBreach: { type: Boolean, default: true },
      breachThreshold: { type: Number, default: 95 }, // Send alert if projected below this %
    },

    // Enable/disable SLA
    enabled: {
      type: Boolean,
      default: true,
    },

    metadata: {
      createdBy: mongoose.Schema.Types.ObjectId,
      lastModifiedBy: mongoose.Schema.Types.ObjectId,
      notes: String,
    },
  },
  {
    timestamps: true,
    collection: 'slaConfigurations',
  }
);

// Indexes
slaConfigurationSchema.index({ monitoringId: 1 });
slaConfigurationSchema.index({ enabled: 1 });
slaConfigurationSchema.index({ 'currentStatus.onTrack': 1 });

const SLAConfiguration = mongoose.model('SLAConfiguration', slaConfigurationSchema);

export default SLAConfiguration;
