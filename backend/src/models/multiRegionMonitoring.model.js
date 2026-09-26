/**
 * Multi-Region Monitoring Configuration
 * Defines monitoring locations and regional strategies
 */

import mongoose from 'mongoose';

const multiRegionMonitoringSchema = new mongoose.Schema(
  {
    // Reference to monitoring service
    monitoringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitoring',
      required: true,
      unique: true,
    },

    // Enable multi-region monitoring
    enabled: {
      type: Boolean,
      default: true,
    },

    // Regions to monitor from
    regions: [
      {
        name: {
          type: String,
          enum: [
            'us-east-1',
            'us-west-1',
            'us-west-2',
            'eu-west-1',
            'eu-central-1',
            'ap-southeast-1',
            'ap-northeast-1',
            'ap-south-1',
            'ca-central-1',
            'sa-east-1',
            'au-sydney-1',
          ],
          required: true,
        },
        location: {
          city: String,
          country: String,
          latitude: Number,
          longitude: Number,
        },
        enabled: { type: Boolean, default: true },
        interval: { type: Number, default: 300 }, // Check interval in seconds
        timeout: { type: Number, default: 10000 }, // Timeout in milliseconds
      },
    ],

    // Strategy for checking
    strategy: {
      type: String,
      enum: ['all', 'majority', 'first-failure', 'weighted'],
      default: 'all',
    },

    // Regional failover configuration
    failover: {
      enabled: { type: Boolean, default: true },
      priorityRegion: String, // Primary region
      fallbackRegions: [String], // Secondary regions in order
    },

    // Regional performance baselines
    baselines: [
      {
        region: String,
        expectedResponseTime: Number, // ms
        expectedUptime: Number, // percentage
        p95ResponseTime: Number,
      },
    ],

    // Regional alerts configuration
    regionalAlerts: {
      enabled: { type: Boolean, default: true },
      alertOnRegionalFailure: { type: Boolean, default: true },
      alertOnLatencyIncrease: { type: Boolean, default: true },
      latencyThreshold: { type: Number, default: 20 }, // percentage increase
    },

    // Performance comparison settings
    comparison: {
      enabled: { type: Boolean, default: true },
      showRegionalDifferences: { type: Boolean, default: true },
      alertOnHighVariance: { type: Boolean, default: true },
      varianceThreshold: { type: Number, default: 30 }, // percentage
    },

    // Geo-targeting for users
    geoTargeting: {
      enabled: { type: Boolean, default: false },
      preferredRegions: [String], // Regions closest to users
    },

    // Last updated tracking
    lastCheck: {
      timestamp: Date,
      region: String,
      status: String,
    },

    metadata: {
      totalRegions: Number,
      activeRegions: Number,
      lastModified: Date,
      modifiedBy: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    collection: 'multiRegionMonitoring',
  }
);

// Indexes
multiRegionMonitoringSchema.index({ monitoringId: 1 });
multiRegionMonitoringSchema.index({ enabled: 1 });
multiRegionMonitoringSchema.index({ 'regions.enabled': 1 });

const MultiRegionMonitoring = mongoose.model('MultiRegionMonitoring', multiRegionMonitoringSchema);

export default MultiRegionMonitoring;
