import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Webhook Model
 * Event-driven integrations with retry mechanism and signature verification
 * Features:
 * - Custom event subscriptions
 * - Retry mechanism (exponential backoff)
 * - HMAC-SHA256 signatures
 * - Webhook testing
 * - Event history
 */

const webhookSchema = new mongoose.Schema(
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
    // Target URL
    url: {
      type: String,
      required: true,
    },
    // Events to subscribe to
    events: [
      {
        type: String,
        enum: [
          'monitoring.check_completed',
          'monitoring.status_changed',
          'alert.triggered',
          'alert.resolved',
          'incident.created',
          'incident.updated',
          'incident.resolved',
          'sla.breached',
          'sla.recovered',
          'maintenance.scheduled',
          'maintenance.started',
          'maintenance.completed',
          'anomaly.detected',
        ],
      },
    ],
    // Filters
    filters: {
      services: [mongoose.Schema.Types.ObjectId], // Specific services, empty = all
      severity: [String], // critical, high, medium, low
      status: [String], // For filtering by status
    },
    // Security
    security: {
      secret: {
        type: String,
        required: true,
      },
      signatureAlgorithm: {
        type: String,
        enum: ['hmac-sha256', 'hmac-sha512'],
        default: 'hmac-sha256',
      },
      verifySSL: {
        type: Boolean,
        default: true,
      },
    },
    // Retry configuration
    retry: {
      maxAttempts: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
      },
      backoff: {
        type: String,
        enum: ['linear', 'exponential'],
        default: 'exponential',
      },
      delaySeconds: {
        type: Number,
        default: 60,
        min: 5,
        max: 3600,
      },
    },
    // Headers
    customHeaders: [
      {
        key: String,
        value: String,
      },
    ],
    // Status
    enabled: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // Event delivery history
    deliveries: [
      {
        eventType: String,
        eventId: String,
        timestamp: {
          type: Date,
          index: true,
        },
        statusCode: Number,
        duration: Number, // milliseconds
        success: Boolean,
        attempt: Number,
        nextRetryAt: Date,
        requestBody: mongoose.Schema.Types.Mixed,
        responseStatus: String,
        responseBody: String,
        error: String,
      },
    ],
    // Statistics
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
      successRate: {
        type: Number,
        default: 100, // percentage
      },
      avgResponseTime: Number, // milliseconds
    },
    // Testing
    testEvent: {
      enabled: Boolean,
      lastTest: Date,
      lastTestResult: {
        success: Boolean,
        statusCode: Number,
        duration: Number,
        error: String,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'webhooks',
  }
);

// ==================== INDEXES ====================
webhookSchema.index({ userId: 1, enabled: 1 });
webhookSchema.index({ teamId: 1, enabled: 1 });
webhookSchema.index({ events: 1 });
webhookSchema.index({ 'deliveries.timestamp': -1 });
webhookSchema.index({ active: 1 });

// TTL index: auto-delete old deliveries after 90 days
webhookSchema.index(
  { 'deliveries.timestamp': 1 },
  { expireAfterSeconds: 7776000, sparse: true }
);

// ==================== STATICS ====================

/**
 * Generate webhook secret
 */
webhookSchema.statics.generateSecret = function () {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Verify webhook signature
 */
webhookSchema.statics.verifySignature = function (payload, signature, secret, algorithm = 'hmac-sha256') {
  const hmacAlgorithm = algorithm === 'hmac-sha512' ? 'sha512' : 'sha256';
  const computedSignature = crypto
    .createHmac(hmacAlgorithm, secret)
    .update(payload)
    .digest('hex');

  return computedSignature === signature;
};

// ==================== METHODS ====================

/**
 * Trigger webhook delivery
 */
webhookSchema.methods.trigger = async function (event) {
  // Check if webhook is interested in this event
  if (!this.events.includes(event.type) || !this.enabled) {
    return null;
  }

  // Apply filters
  if (!this.matchesFilters(event)) {
    return null;
  }

  // Create delivery attempt
  const delivery = {
    eventType: event.type,
    eventId: event.id,
    timestamp: new Date(),
    attempt: 1,
    requestBody: event.payload,
  };

  // Generate signature
  const payload = JSON.stringify(event.payload);
  const signature = crypto
    .createHmac(
      this.security.signatureAlgorithm === 'hmac-sha512' ? 'sha512' : 'sha256',
      this.security.secret
    )
    .update(payload)
    .digest('hex');

  // Record delivery
  this.deliveries.push(delivery);

  // Update statistics
  this.statistics.totalEvents += 1;

  return { payload, signature, delivery };
};

/**
 * Match event against filters
 */
webhookSchema.methods.matchesFilters = function (event) {
  // Service filter
  if (this.filters.services.length > 0 && event.serviceId) {
    if (
      !this.filters.services.some((s) => s.equals(event.serviceId))
    ) {
      return false;
    }
  }

  // Severity filter
  if (this.filters.severity.length > 0 && event.severity) {
    if (!this.filters.severity.includes(event.severity)) {
      return false;
    }
  }

  // Status filter
  if (this.filters.status.length > 0 && event.status) {
    if (!this.filters.status.includes(event.status)) {
      return false;
    }
  }

  return true;
};

/**
 * Record delivery result
 */
webhookSchema.methods.recordDelivery = async function (
  deliveryIndex,
  statusCode,
  duration,
  responseBody,
  error
) {
  const delivery = this.deliveries[deliveryIndex];

  if (!delivery) return;

  delivery.statusCode = statusCode;
  delivery.duration = duration;
  delivery.responseBody = responseBody;
  delivery.error = error;
  delivery.success = statusCode >= 200 && statusCode < 300;

  if (delivery.success) {
    this.statistics.successfulDeliveries += 1;
  } else {
    this.statistics.failedDeliveries += 1;

    // Schedule retry if enabled
    if (delivery.attempt < this.retry.maxAttempts) {
      const delay =
        this.retry.backoff === 'exponential'
          ? this.retry.delaySeconds * Math.pow(2, delivery.attempt - 1)
          : this.retry.delaySeconds * delivery.attempt;

      delivery.nextRetryAt = new Date(Date.now() + delay * 1000);
      delivery.attempt += 1;
    } else {
      this.active = false; // Disable webhook after max retries
    }
  }

  // Update stats
  this.statistics.lastDelivery = new Date();
  this.statistics.avgResponseTime =
    (this.statistics.avgResponseTime * (this.statistics.successfulDeliveries - 1) +
      duration) /
    this.statistics.successfulDeliveries;

  this.statistics.successRate =
    (this.statistics.successfulDeliveries / this.statistics.totalEvents) * 100;

  return this.save();
};

/**
 * Test webhook
 */
webhookSchema.methods.test = async function () {
  this.testEvent.enabled = true;
  this.testEvent.lastTest = new Date();

  // This would be implemented to actually test the webhook
  // For now, it's a placeholder
  return this.save();
};

/**
 * Get delivery history
 */
webhookSchema.methods.getDeliveryHistory = function (limit = 50) {
  return this.deliveries
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Get failed deliveries pending retry
 */
webhookSchema.methods.getFailedDeliveries = function () {
  return this.deliveries.filter(
    (d) => !d.success && d.nextRetryAt && new Date() >= d.nextRetryAt
  );
};

/**
 * Disable webhook
 */
webhookSchema.methods.disable = async function (reason) {
  this.enabled = false;
  this.active = false;
  return this.save();
};

/**
 * Enable webhook
 */
webhookSchema.methods.enable = async function () {
  this.enabled = true;
  this.active = true;
  return this.save();
};

export default mongoose.model('Webhook', webhookSchema);
