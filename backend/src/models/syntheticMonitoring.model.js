import mongoose from 'mongoose';

/**
 * Synthetic Monitoring Model
 * Simulates user transactions, measures network waterfalls, captures screenshots/videos
 * Features:
 * - Transaction scenario scripting
 * - Geo-distributed execution (multiple regions)
 * - Screenshot/video capture
 * - Network waterfall analysis
 * - JavaScript execution tracking
 * - Performance metrics collection
 */

const syntheticMonitoringSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    monitoringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitoring',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    // Scenario configuration
    scenario: {
      type: {
        type: String,
        enum: ['transaction', 'api_call', 'page_load', 'custom'],
        default: 'transaction',
      },
      steps: [
        {
          id: String,
          type: {
            type: String,
            enum: ['navigate', 'click', 'type', 'wait', 'screenshot', 'measure'],
          },
          selector: String,
          value: String,
          waitTime: Number, // milliseconds
          description: String,
          order: Number,
        },
      ],
      timeout: {
        type: Number,
        default: 30000, // 30 seconds
      },
    },
    // Execution configuration
    execution: {
      regions: {
        type: [String],
        enum: [
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
        ],
        default: ['us-east-1'],
      },
      frequency: {
        type: String,
        enum: ['1min', '5min', '15min', '30min', '1hour', '6hours', '24hours'],
        default: '5min',
      },
      enabled: {
        type: Boolean,
        default: true,
      },
      browsers: {
        type: [String],
        enum: ['chrome', 'firefox', 'safari', 'edge'],
        default: ['chrome'],
      },
      networkProfiles: {
        type: [String],
        enum: ['5g', '4g', '3g', 'wifi', 'offline'],
        default: ['wifi'],
      },
    },
    // Assertions & validations
    assertions: [
      {
        type: {
          type: String,
          enum: ['response_time', 'status_code', 'element_present', 'text_present', 'custom'],
        },
        target: String, // URL, selector, etc.
        operator: String, // <, >, ==, contains, etc.
        expected: mongoose.Schema.Types.Mixed,
        description: String,
      },
    ],
    // Performance thresholds
    thresholds: {
      responseTime: {
        type: Number,
        default: 2000, // milliseconds
      },
      pageLoadTime: {
        type: Number,
        default: 5000,
      },
      resourceLoadTime: {
        type: Number,
        default: 1000,
      },
      jsExecutionTime: {
        type: Number,
        default: 500,
      },
    },
    // Results tracking
    results: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
          index: true,
        },
        region: String,
        browser: String,
        networkProfile: String,
        status: {
          type: String,
          enum: ['success', 'failed', 'timeout'],
        },
        metrics: {
          responseTime: Number,
          pageLoadTime: Number,
          firstContentfulPaint: Number,
          largestContentfulPaint: Number,
          cumulativeLayoutShift: Number,
          timeToInteractive: Number,
          jsExecutionTime: Number,
          resourceCount: Number,
          totalBytes: Number,
        },
        // Network waterfall
        networkWaterfall: [
          {
            resource: String, // URL
            type: String, // document, stylesheet, script, image, xhr, etc.
            startTime: Number, // ms from navigation start
            duration: Number, // ms
            size: Number, // bytes
            status: Number, // HTTP status
            cached: Boolean,
          },
        ],
        // Screenshot & video
        screenshot: {
          url: String, // S3 URL
          captureTime: Date,
          dimensions: {
            width: Number,
            height: Number,
          },
        },
        video: {
          url: String, // S3 URL
          duration: Number, // seconds
          captureTime: Date,
        },
        // Assertion results
        assertionResults: [
          {
            assertionId: String,
            passed: Boolean,
            actual: mongoose.Schema.Types.Mixed,
            expected: mongoose.Schema.Types.Mixed,
            message: String,
          },
        ],
        // Errors
        errors: [
          {
            message: String,
            stack: String,
            timestamp: Date,
          },
        ],
        // Console logs
        consoleLogs: [
          {
            level: String, // log, warn, error
            message: String,
            timestamp: Date,
          },
        ],
      },
    ],
    // Summary statistics
    statistics: {
      totalRuns: {
        type: Number,
        default: 0,
      },
      successfulRuns: {
        type: Number,
        default: 0,
      },
      failedRuns: {
        type: Number,
        default: 0,
      },
      timeoutRuns: {
        type: Number,
        default: 0,
      },
      avgResponseTime: {
        type: Number,
        default: 0,
      },
      p95ResponseTime: Number,
      p99ResponseTime: Number,
      lastRun: Date,
      uptime: {
        type: Number,
        default: 100, // percentage
      },
    },
    // Alerts
    alerts: {
      enabled: {
        type: Boolean,
        default: true,
      },
      notifyOn: [
        {
          type: String,
          enum: ['failure', 'threshold_breach', 'assertion_failed', 'timeout'],
        },
      ],
      channels: [String], // email, slack, pagerduty, etc.
    },
    // Tags & metadata
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'syntheticMonitoring',
  }
);

// ==================== INDEXES ====================
syntheticMonitoringSchema.index({ userId: 1, enabled: 1 });
syntheticMonitoringSchema.index({ monitoringId: 1 });
syntheticMonitoringSchema.index({ 'execution.frequency': 1 });
syntheticMonitoringSchema.index({ 'results.timestamp': -1 });
syntheticMonitoringSchema.index({ 'results.status': 1 });
syntheticMonitoringSchema.index({ tags: 1 });

// TTL index: auto-delete results after 90 days
syntheticMonitoringSchema.index(
  { 'results.timestamp': 1 },
  { expireAfterSeconds: 7776000, sparse: true }
);

// ==================== METHODS ====================

/**
 * Record synthetic test result
 */
syntheticMonitoringSchema.methods.recordResult = async function (result) {
  this.results.push(result);
  this.statistics.totalRuns += 1;

  if (result.status === 'success') {
    this.statistics.successfulRuns += 1;
    this.statistics.avgResponseTime =
      (this.statistics.avgResponseTime * (this.statistics.successfulRuns - 1) +
        result.metrics.responseTime) /
      this.statistics.successfulRuns;
  } else if (result.status === 'failed') {
    this.statistics.failedRuns += 1;
  } else if (result.status === 'timeout') {
    this.statistics.timeoutRuns += 1;
  }

  // Update uptime percentage
  this.statistics.uptime =
    (this.statistics.successfulRuns / this.statistics.totalRuns) * 100;
  this.statistics.lastRun = new Date();

  return this.save();
};

/**
 * Get results for time period
 */
syntheticMonitoringSchema.methods.getResults = function (startDate, endDate) {
  return this.results.filter(
    (r) => new Date(r.timestamp) >= startDate && new Date(r.timestamp) <= endDate
  );
};

/**
 * Get regional performance summary
 */
syntheticMonitoringSchema.methods.getRegionalSummary = function (limit = 7) {
  const recentResults = this.results.slice(-limit);
  const byRegion = {};

  recentResults.forEach((result) => {
    if (!byRegion[result.region]) {
      byRegion[result.region] = {
        region: result.region,
        runs: 0,
        successful: 0,
        avgResponseTime: 0,
        errors: 0,
      };
    }

    byRegion[result.region].runs += 1;
    if (result.status === 'success') {
      byRegion[result.region].successful += 1;
      byRegion[result.region].avgResponseTime +=
        result.metrics.responseTime / byRegion[result.region].runs;
    } else {
      byRegion[result.region].errors += 1;
    }
  });

  return Object.values(byRegion);
};

/**
 * Get performance trend
 */
syntheticMonitoringSchema.methods.getPerformanceTrend = function (days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recentResults = this.results.filter(
    (r) => new Date(r.timestamp) >= cutoffDate
  );

  const trend = {};

  recentResults.forEach((result) => {
    const dateKey = new Date(result.timestamp).toISOString().split('T')[0];

    if (!trend[dateKey]) {
      trend[dateKey] = {
        date: dateKey,
        runs: 0,
        successful: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
      };
    }

    trend[dateKey].runs += 1;
    if (result.status === 'success') {
      trend[dateKey].successful += 1;
      trend[dateKey].avgResponseTime +=
        (result.metrics.responseTime - trend[dateKey].avgResponseTime) /
        trend[dateKey].successful;
      trend[dateKey].maxResponseTime = Math.max(
        trend[dateKey].maxResponseTime,
        result.metrics.responseTime
      );
      trend[dateKey].minResponseTime = Math.min(
        trend[dateKey].minResponseTime,
        result.metrics.responseTime
      );
    }
  });

  return Object.values(trend);
};

// ==================== MIDDLEWARE ====================

syntheticMonitoringSchema.pre('save', function (next) {
  if (this.results.length > 1000) {
    // Keep only last 1000 results in memory, older ones should use TTL index
    this.results = this.results.slice(-1000);
  }
  next();
});

export default mongoose.model('SyntheticMonitoring', syntheticMonitoringSchema);
