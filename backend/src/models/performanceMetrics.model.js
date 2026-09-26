/**
 * Performance Metrics Model
 * Stores detailed performance data for each monitoring check
 * Enables SLA tracking, trend analysis, and performance insights
 */

import mongoose from 'mongoose';

const performanceMetricsSchema = new mongoose.Schema(
  {
    // Reference to monitoring service
    monitoringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitoring',
      required: true,
      index: true,
    },

    // Timestamp of the check
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Response time metrics (milliseconds)
    responseTime: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      mean: { type: Number, default: 0 },
      median: { type: Number, default: 0 },
      p95: { type: Number, default: 0 },
      p99: { type: Number, default: 0 },
    },

    // Network timing breakdown (milliseconds)
    networkTimings: {
      dns: { type: Number, default: 0 }, // DNS lookup
      tcp: { type: Number, default: 0 }, // TCP connection
      tls: { type: Number, default: 0 }, // TLS handshake
      firstByte: { type: Number, default: 0 }, // TTFB
      contentTransfer: { type: Number, default: 0 }, // Download time
      total: { type: Number, default: 0 }, // Total
    },

    // HTTP metrics
    http: {
      statusCode: { type: Number, required: true },
      statusCategory: { type: String, enum: ['1xx', '2xx', '3xx', '4xx', '5xx'], required: true },
      contentLength: { type: Number, default: 0 },
      headerSize: { type: Number, default: 0 },
      redirectCount: { type: Number, default: 0 },
    },

    // SSL/TLS metrics
    ssl: {
      version: String, // TLSv1.2, TLSv1.3, etc.
      cipher: String, // Cipher suite
      certificateValidDays: Number, // Days until expiry
      isValid: { type: Boolean, default: true },
      issuer: String,
      subject: String,
    },

    // Core Web Vitals (Largest Contentful Paint, First Input Delay, Cumulative Layout Shift)
    webVitals: {
      lcp: Number, // Largest Contentful Paint (ms)
      fid: Number, // First Input Delay (ms)
      cls: Number, // Cumulative Layout Shift (unitless)
      ttfb: Number, // Time to First Byte (ms)
    },

    // Availability metrics
    availability: {
      isOnline: { type: Boolean, required: true },
      uptime: { type: Number, default: 100 }, // Percentage
      downtime: { type: Number, default: 0 }, // Milliseconds
    },

    // Error information
    error: {
      occurred: { type: Boolean, default: false },
      type: String, // 'timeout', 'connection', 'ssl', 'http', etc.
      code: String, // Error code
      message: String,
    },

    // Geographic location of check
    location: {
      region: String, // 'us-east-1', 'eu-west-1', etc.
      country: String, // Country code
      city: String,
      latitude: Number,
      longitude: Number,
    },

    // Request details
    request: {
      method: { type: String, default: 'GET' },
      url: String,
      headers: mongoose.Schema.Types.Mixed,
      body: mongoose.Schema.Types.Mixed,
    },

    // Response details
    response: {
      statusCode: Number,
      headers: mongoose.Schema.Types.Mixed,
      bodySize: Number,
      bodyPreview: String, // First 1000 chars for debugging
    },

    // Resource metrics (for SPA monitoring)
    resources: {
      totalCount: { type: Number, default: 0 },
      fetchCount: { type: Number, default: 0 },
      jsCount: { type: Number, default: 0 },
      cssCount: { type: Number, default: 0 },
      imageCount: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 },
    },

    // Custom metrics (user-defined)
    customMetrics: mongoose.Schema.Types.Mixed,

    // Comparison with baseline
    baseline: {
      expectedResponseTime: Number,
      expectedStatusCode: Number,
      variance: Number, // Percentage deviation
    },

    // Anomaly detection
    anomaly: {
      isAnomaly: { type: Boolean, default: false },
      anomalyScore: { type: Number, default: 0 }, // 0-100
      anomalyReason: String,
      confidenceLevel: { type: Number, default: 0 }, // 0-1
    },

    // Metadata
    metadata: {
      checkDuration: Number, // Total check execution time
      retries: { type: Number, default: 0 },
      cacheHit: { type: Boolean, default: false },
      region: String,
      checkType: { type: String, enum: ['http', 'https', 'tcp', 'dns', 'synthetic'] },
    },
  },
  {
    timestamps: true,
    collection: 'performanceMetrics',
  }
);

// Indexes for performance
performanceMetricsSchema.index({ monitoringId: 1, timestamp: -1 });
performanceMetricsSchema.index({ timestamp: -1 });
performanceMetricsSchema.index({ 'http.statusCode': 1 });
performanceMetricsSchema.index({ 'availability.isOnline': 1 });
performanceMetricsSchema.index({ 'anomaly.isAnomaly': 1 });

// TTL index: auto-delete metrics older than 90 days
performanceMetricsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Compound indexes for common queries
performanceMetricsSchema.index({ monitoringId: 1, 'availability.isOnline': 1, timestamp: -1 });
performanceMetricsSchema.index({ monitoringId: 1, 'http.statusCode': 1, timestamp: -1 });

const PerformanceMetrics = mongoose.model('PerformanceMetrics', performanceMetricsSchema);

export default PerformanceMetrics;
