import mongoose from 'mongoose';

/**
 * Anomaly Detection Model
 * ML-based detection using statistical analysis, baselines, and forecasting
 * Features:
 * - Multiple detection algorithms
 * - Time-series baselines
 * - Seasonal adjustment
 * - Forecast variance tracking
 * - Anomaly scoring
 */

const anomalyDetectionSchema = new mongoose.Schema(
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
    metric: {
      type: String,
      required: true, // responseTime, errorRate, cpuUsage, etc.
      index: true,
    },
    // Detection configuration
    detection: {
      algorithm: {
        type: String,
        enum: ['zscore', 'isolation_forest', 'kmeans', 'statistical', 'ml_ensemble'],
        default: 'statistical',
      },
      enabled: {
        type: Boolean,
        default: true,
      },
      sensitivity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      // Threshold multipliers
      thresholds: {
        zscore: {
          type: Number,
          default: 3, // 3 standard deviations
        },
        percentileAbove: {
          type: Number,
          default: 95, // 95th percentile
        },
        percentileBelow: {
          type: Number,
          default: 5, // 5th percentile
        },
        rateOfChange: {
          type: Number,
          default: 0.5, // 50% change threshold
        },
      },
    },
    // Baseline data (hourly aggregates)
    baselines: [
      {
        hour: Number, // 0-23
        dayOfWeek: Number, // 0-6
        avg: Number,
        min: Number,
        max: Number,
        p50: Number,
        p95: Number,
        p99: Number,
        stddev: Number,
        count: Number,
        lastUpdated: Date,
      },
    ],
    // Time-series data (for trend analysis)
    timeSeries: [
      {
        timestamp: {
          type: Date,
          index: true,
        },
        value: Number,
        baseline: Number,
        deviation: Number, // (value - baseline) / baseline * 100
        zscore: Number,
        isAnomaly: Boolean,
        anomalyScore: {
          type: Number,
          min: 0,
          max: 100,
        },
        confidence: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    // Detected anomalies
    detectedAnomalies: [
      {
        startTime: Date,
        endTime: Date,
        duration: Number, // seconds
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
        },
        value: Number,
        baselineValue: Number,
        deviation: Number, // percentage
        anomalyScore: {
          type: Number,
          min: 0,
          max: 100,
        },
        reason: String, // Why it was detected as anomaly
        type: {
          type: String,
          enum: ['spike', 'dip', 'trend_change', 'cycle_change', 'level_shift'],
        },
        acknowledged: Boolean,
        acknowledgedBy: mongoose.Schema.Types.ObjectId,
        acknowledgedAt: Date,
        rootCause: String,
        alert: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Alert',
        },
      },
    ],
    // Forecast data (next 24 hours)
    forecast: {
      enabled: {
        type: Boolean,
        default: true,
      },
      model: {
        type: String,
        enum: ['arima', 'exponential_smoothing', 'prophet', 'lstm'],
        default: 'prophet',
      },
      predictions: [
        {
          timestamp: Date,
          predicted: Number,
          lower_bound: Number,
          upper_bound: Number,
          confidence: Number,
        },
      ],
      lastUpdated: Date,
      accuracy: Number, // Mean Absolute Percentage Error (MAPE)
    },
    // Seasonal patterns
    seasonality: {
      detected: Boolean,
      period: String, // hourly, daily, weekly
      strength: Number, // 0-100
      factors: [Number], // Seasonal adjustment factors
    },
    // Trend analysis
    trend: {
      direction: {
        type: String,
        enum: ['up', 'down', 'stable'],
      },
      strength: Number, // 0-100
      slope: Number,
      lastUpdated: Date,
    },
    // Statistics summary
    statistics: {
      dataPoints: {
        type: Number,
        default: 0,
      },
      mean: Number,
      median: Number,
      stddev: Number,
      min: Number,
      max: Number,
      anomaliesDetected: {
        type: Number,
        default: 0,
      },
      lastUpdated: Date,
    },
    // Alert configuration
    alerts: {
      enabled: {
        type: Boolean,
        default: true,
      },
      channels: [String],
      notifyOn: [
        {
          type: String,
          enum: ['high_anomaly', 'multiple_anomalies', 'trend_change', 'forecast_breach'],
        },
      ],
    },
    // Model performance
    modelPerformance: {
      precision: Number,
      recall: Number,
      f1Score: Number,
      rocAuc: Number,
      lastEvaluated: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'anomalyDetection',
  }
);

// ==================== INDEXES ====================
anomalyDetectionSchema.index({ userId: 1, metricName: 1 });
anomalyDetectionSchema.index({ monitoringId: 1 });
anomalyDetectionSchema.index({ 'timeSeries.timestamp': -1 });
anomalyDetectionSchema.index({ 'detectedAnomalies.startTime': -1 });
anomalyDetectionSchema.index({ 'detectedAnomalies.acknowledged': 1 });

// TTL index: auto-delete old time-series after 180 days
anomalyDetectionSchema.index(
  { 'timeSeries.timestamp': 1 },
  { expireAfterSeconds: 15552000, sparse: true }
);

// ==================== METHODS ====================

/**
 * Add data point and detect anomalies
 */
anomalyDetectionSchema.methods.addDataPoint = async function (timestamp, value) {
  // Calculate baseline
  const hour = new Date(timestamp).getHours();
  const dayOfWeek = new Date(timestamp).getDay();
  const baseline = this.getBaseline(hour, dayOfWeek);

  // Calculate deviation
  const deviation = baseline ? ((value - baseline) / baseline) * 100 : 0;

  // Calculate Z-score
  const zscore =
    this.statistics.stddev > 0
      ? (value - this.statistics.mean) / this.statistics.stddev
      : 0;

  // Determine if anomaly
  const isAnomaly = this.isAnomaly(value, baseline, zscore);
  const anomalyScore = this.calculateAnomalyScore(value, baseline, zscore);

  // Add to time series
  this.timeSeries.push({
    timestamp,
    value,
    baseline: baseline || this.statistics.mean,
    deviation,
    zscore,
    isAnomaly,
    anomalyScore,
    confidence: this.calculateConfidence(isAnomaly, anomalyScore),
  });

  // Update statistics
  this.updateStatistics();

  // Check if anomaly
  if (isAnomaly && anomalyScore > 70) {
    await this.recordAnomaly(timestamp, value, baseline, anomalyScore);
  }

  return this.save();
};

/**
 * Get baseline for specific hour and day
 */
anomalyDetectionSchema.methods.getBaseline = function (hour, dayOfWeek) {
  const baseline = this.baselines.find(
    (b) => b.hour === hour && b.dayOfWeek === dayOfWeek
  );
  return baseline ? baseline.avg : this.statistics.mean;
};

/**
 * Determine if value is anomaly
 */
anomalyDetectionSchema.methods.isAnomaly = function (value, baseline, zscore) {
  const { thresholds } = this.detection;

  switch (this.detection.algorithm) {
    case 'zscore':
      return Math.abs(zscore) > thresholds.zscore;
    case 'statistical':
      return (
        Math.abs(zscore) > 2 ||
        (baseline && Math.abs((value - baseline) / baseline) > 0.5)
      );
    default:
      return false;
  }
};

/**
 * Calculate anomaly score (0-100)
 */
anomalyDetectionSchema.methods.calculateAnomalyScore = function (
  value,
  baseline,
  zscore
) {
  let score = 0;

  // Z-score component (0-40)
  score += Math.min(40, (Math.abs(zscore) / 5) * 40);

  // Deviation component (0-40)
  if (baseline) {
    const deviation = Math.abs((value - baseline) / baseline);
    score += Math.min(40, (deviation / 2) * 40);
  }

  // Rarity component (0-20)
  const p = this.calculatePercentile(value);
  if (p < 5 || p > 95) {
    score += 20;
  }

  return Math.min(100, score);
};

/**
 * Calculate confidence (0-100)
 */
anomalyDetectionSchema.methods.calculateConfidence = function (isAnomaly, score) {
  if (!isAnomaly) return Math.min(100, 100 - score);
  return Math.min(100, score * 1.2);
};

/**
 * Calculate percentile
 */
anomalyDetectionSchema.methods.calculatePercentile = function (value) {
  const sorted = this.timeSeries
    .map((t) => t.value)
    .sort((a, b) => a - b);
  const position = sorted.findIndex((v) => v >= value);
  return ((position / sorted.length) * 100) | 0;
};

/**
 * Record detected anomaly
 */
anomalyDetectionSchema.methods.recordAnomaly = async function (
  startTime,
  value,
  baseline,
  score
) {
  const anomaly = {
    startTime,
    endTime: startTime,
    duration: 0,
    severity: score > 90 ? 'critical' : score > 75 ? 'high' : 'medium',
    value,
    baselineValue: baseline,
    deviation: baseline ? ((value - baseline) / baseline) * 100 : 0,
    anomalyScore: score,
    type: value > baseline ? 'spike' : 'dip',
    acknowledged: false,
  };

  this.detectedAnomalies.push(anomaly);
  this.statistics.anomaliesDetected += 1;

  return this;
};

/**
 * Update statistics
 */
anomalyDetectionSchema.methods.updateStatistics = function () {
  const values = this.timeSeries.map((t) => t.value);

  if (values.length === 0) return;

  // Mean
  this.statistics.mean = values.reduce((a, b) => a + b, 0) / values.length;

  // Median
  const sorted = [...values].sort((a, b) => a - b);
  this.statistics.median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  // Std Dev
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - this.statistics.mean, 2), 0) /
    values.length;
  this.statistics.stddev = Math.sqrt(variance);

  // Min/Max
  this.statistics.min = Math.min(...values);
  this.statistics.max = Math.max(...values);
  this.statistics.dataPoints = values.length;
  this.statistics.lastUpdated = new Date();
};

/**
 * Get anomalies in time range
 */
anomalyDetectionSchema.methods.getAnomalies = function (startDate, endDate) {
  return this.detectedAnomalies.filter(
    (a) =>
      new Date(a.startTime) >= startDate && new Date(a.startTime) <= endDate
  );
};

/**
 * Acknowledge anomaly
 */
anomalyDetectionSchema.methods.acknowledgeAnomaly = async function (
  anomalyId,
  userId,
  rootCause
) {
  const anomaly = this.detectedAnomalies.find((a) => a._id.equals(anomalyId));

  if (anomaly) {
    anomaly.acknowledged = true;
    anomaly.acknowledgedBy = userId;
    anomaly.acknowledgedAt = new Date();
    anomaly.rootCause = rootCause;
  }

  return this.save();
};

export default mongoose.model('AnomalyDetection', anomalyDetectionSchema);
