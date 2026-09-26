import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * API Key Management Model
 * Handles programmatic access to Pulse Monitor API
 * Features:
 * - Secure key generation and hashing
 * - Granular permission scoping (read-only, write, admin)
 * - Rate limiting per key
 * - Usage tracking and analytics
 * - Key rotation and revocation
 * - Last used tracking for security auditing
 */

const apiKeySchema = new mongoose.Schema(
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
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: null,
    },
    // Hashed key for storage (never store plain keys)
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Plain key prefix for display (first 8 chars, last 4 chars)
    keyPrefix: {
      type: String,
      required: true,
      // Format: "pk_xxxxxxxx...xxxx"
    },
    // Permissions scope
    permissions: {
      type: [String],
      enum: [
        'monitoring:read',
        'monitoring:write',
        'monitoring:delete',
        'alerts:read',
        'alerts:write',
        'alerts:delete',
        'incidents:read',
        'incidents:write',
        'incidents:delete',
        'sla:read',
        'sla:write',
        'team:read',
        'team:write',
        'team:admin',
        'analytics:read',
        'webhooks:read',
        'webhooks:write',
        'admin:all', // Full access (only for team admins)
      ],
      default: ['monitoring:read', 'alerts:read'],
    },
    // Rate limiting configuration
    rateLimit: {
      enabled: {
        type: Boolean,
        default: true,
      },
      requestsPerMinute: {
        type: Number,
        default: 60,
        min: 1,
        max: 10000,
      },
      requestsPerHour: {
        type: Number,
        default: 1800,
        min: 1,
        max: 100000,
      },
      requestsPerDay: {
        type: Number,
        default: 50000,
        min: 1,
        max: 1000000,
      },
    },
    // IP whitelist for additional security
    ipWhitelist: {
      enabled: {
        type: Boolean,
        default: false,
      },
      ips: [
        {
          ip: {
            type: String,
            required: true,
            // Support IPv4, IPv6, CIDR notation
          },
          description: {
            type: String,
            maxlength: 200,
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    // Allowed services this key can access
    allowedServices: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Monitoring',
      default: [], // Empty array = all services for user
    },
    // Usage tracking
    usageStats: {
      totalRequests: {
        type: Number,
        default: 0,
        index: true,
      },
      totalErrors: {
        type: Number,
        default: 0,
      },
      totalBytesTransferred: {
        type: Number,
        default: 0,
      },
      lastUsedAt: {
        type: Date,
        sparse: true,
        index: true,
      },
      lastUsedIp: String,
      lastUsedEndpoint: String,
      rateLimitHitsToday: {
        type: Number,
        default: 0,
      },
      monthlyRequests: {
        type: Number,
        default: 0,
      },
    },
    // Usage by endpoint (for analytics)
    endpointUsage: [
      {
        endpoint: String,
        method: {
          type: String,
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        },
        requestCount: {
          type: Number,
          default: 0,
        },
        errorCount: {
          type: Number,
          default: 0,
        },
        avgResponseTime: Number,
        lastUsedAt: Date,
      },
    ],
    // Key expiration
    expiresAt: {
      type: Date,
      sparse: true,
      index: true,
      // null = never expires
    },
    // Key status
    status: {
      type: String,
      enum: ['active', 'inactive', 'revoked', 'expired'],
      default: 'active',
      index: true,
    },
    revocationReason: {
      type: String,
      maxlength: 500,
      default: null,
    },
    revokedAt: {
      type: Date,
      sparse: true,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    // Rotation tracking
    rotationHistory: [
      {
        oldKeyHash: String,
        rotatedAt: {
          type: Date,
          default: Date.now,
        },
        rotationReason: String,
      },
    ],
    // Webhook events
    webhookEvents: {
      enabled: {
        type: Boolean,
        default: false,
      },
      url: {
        type: String,
        sparse: true,
      },
      events: [
        {
          type: String,
          enum: ['monitoring:checked', 'alert:triggered', 'incident:created', 'incident:resolved'],
        },
      ],
    },
    // Security metadata
    security: {
      lastRotationAt: Date,
      createdFrom: String, // User agent / client info
      securityFlags: {
        suspiciousActivity: Boolean,
        multipleFailedAttempts: {
          type: Number,
          default: 0,
        },
        lastFailedAttemptAt: Date,
      },
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'apiKeys',
  }
);

// ==================== INDEXES ====================
apiKeySchema.index({ userId: 1, status: 1 });
apiKeySchema.index({ teamId: 1, status: 1 });
apiKeySchema.index({ keyHash: 1, status: 1 });
apiKeySchema.index({ expiresAt: 1 }, { sparse: true });
apiKeySchema.index({ 'usageStats.lastUsedAt': -1 });
apiKeySchema.index({ createdAt: -1 });
apiKeySchema.index({ status: 1, expiresAt: 1 });

// TTL index: auto-delete revoked keys after 90 days
apiKeySchema.index(
  { revokedAt: 1 },
  { expireAfterSeconds: 7776000, sparse: true } // 90 days
);

// ==================== STATICS ====================

/**
 * Generate a secure API key
 * Format: pk_<random_32_chars>
 * Returns: { plainKey, keyHash, keyPrefix }
 */
apiKeySchema.statics.generateKey = function() {
  const plainKey = 'pk_' + crypto.randomBytes(32).toString('hex');
  const keyHash = crypto
    .createHash('sha256')
    .update(plainKey)
    .digest('hex');
  const keyPrefix = plainKey.substring(0, 14) + '...' + plainKey.substring(-4);
  
  return { plainKey, keyHash, keyPrefix };
};

/**
 * Validate and retrieve API key by plain key
 * Returns the document and null if not found or invalid
 */
apiKeySchema.statics.findByPlainKey = async function(plainKey) {
  if (!plainKey) return null;
  
  const keyHash = crypto
    .createHash('sha256')
    .update(plainKey)
    .digest('hex');
  
  return this.findOne({
    keyHash,
    status: 'active',
  }).populate(['userId', 'teamId']);
};

/**
 * Get all active keys for a user
 */
apiKeySchema.statics.getActiveKeysForUser = function(userId) {
  return this.find({
    userId,
    status: 'active',
  }).sort({ createdAt: -1 });
};

/**
 * Get all active keys for a team
 */
apiKeySchema.statics.getActiveKeysForTeam = function(teamId) {
  return this.find({
    teamId,
    status: 'active',
  }).sort({ createdAt: -1 });
};

// ==================== METHODS ====================

/**
 * Check if key has specific permission
 */
apiKeySchema.methods.hasPermission = function(permission) {
  if (this.permissions.includes('admin:all')) return true;
  return this.permissions.includes(permission);
};

/**
 * Check if key has read access to a service
 */
apiKeySchema.methods.canAccessService = function(serviceId) {
  if (this.allowedServices.length === 0) return true; // All services
  return this.allowedServices.some(
    (id) => id.toString() === serviceId.toString()
  );
};

/**
 * Check if key is valid for use
 */
apiKeySchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

/**
 * Check if rate limit is exceeded
 */
apiKeySchema.methods.isRateLimited = function(timeWindow = 'minute') {
  if (!this.rateLimit.enabled) return false;
  
  const limits = {
    minute: this.rateLimit.requestsPerMinute,
    hour: this.rateLimit.requestsPerHour,
    day: this.rateLimit.requestsPerDay,
  };
  
  const usage = {
    minute: this.usageStats.totalRequests % 1000, // Simplified for demo
    hour: this.usageStats.totalRequests % 10000,
    day: this.usageStats.totalRequests,
  };
  
  return usage[timeWindow] >= limits[timeWindow];
};

/**
 * Record API key usage
 */
apiKeySchema.methods.recordUsage = async function(
  endpoint,
  method,
  statusCode,
  responseTime,
  bytesTransferred,
  clientIp
) {
  this.usageStats.totalRequests += 1;
  this.usageStats.lastUsedAt = new Date();
  this.usageStats.lastUsedIp = clientIp;
  this.usageStats.lastUsedEndpoint = endpoint;
  this.usageStats.totalBytesTransferred += bytesTransferred || 0;
  this.usageStats.monthlyRequests += 1;
  
  if (statusCode >= 400) {
    this.usageStats.totalErrors += 1;
  }
  
  // Update endpoint usage stats
  let endpointRecord = this.endpointUsage.find(
    (e) => e.endpoint === endpoint && e.method === method
  );
  
  if (!endpointRecord) {
    endpointRecord = {
      endpoint,
      method,
      requestCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
    };
    this.endpointUsage.push(endpointRecord);
  }
  
  endpointRecord.requestCount += 1;
  if (statusCode >= 400) endpointRecord.errorCount += 1;
  
  // Update average response time
  if (responseTime) {
    const totalTime =
      (endpointRecord.avgResponseTime || 0) * (endpointRecord.requestCount - 1);
    endpointRecord.avgResponseTime = (totalTime + responseTime) / endpointRecord.requestCount;
  }
  
  endpointRecord.lastUsedAt = new Date();
  
  return this.save();
};

/**
 * Revoke API key
 */
apiKeySchema.methods.revoke = async function(reason, revokedBy) {
  this.status = 'revoked';
  this.revocationReason = reason;
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  
  // Store rotation history
  this.rotationHistory.push({
    oldKeyHash: this.keyHash,
    rotatedAt: new Date(),
    rotationReason: reason,
  });
  
  return this.save();
};

/**
 * Rotate API key (generate new key, keep permissions)
 */
apiKeySchema.methods.rotateKey = async function(reason) {
  const { plainKey, keyHash, keyPrefix } = this.constructor.generateKey();
  
  this.rotationHistory.push({
    oldKeyHash: this.keyHash,
    rotatedAt: new Date(),
    rotationReason: reason || 'Key rotation',
  });
  
  this.keyHash = keyHash;
  this.keyPrefix = keyPrefix;
  this.security.lastRotationAt = new Date();
  
  await this.save();
  
  return plainKey; // Return plain key once to user
};

/**
 * Check for suspicious activity
 */
apiKeySchema.methods.checkSuspiciousActivity = async function() {
  // Reset after 24 hours
  if (
    this.security.securityFlags.lastFailedAttemptAt &&
    new Date() - this.security.securityFlags.lastFailedAttemptAt > 86400000
  ) {
    this.security.securityFlags.multipleFailedAttempts = 0;
  }
  
  // Flag if more than 10 failed attempts in 24 hours
  if (this.security.securityFlags.multipleFailedAttempts > 10) {
    this.security.securityFlags.suspiciousActivity = true;
    if (this.status === 'active') {
      this.status = 'inactive';
      await this.save();
    }
  }
};

/**
 * Record failed authentication attempt
 */
apiKeySchema.methods.recordFailedAttempt = async function() {
  this.security.securityFlags.multipleFailedAttempts += 1;
  this.security.securityFlags.lastFailedAttemptAt = new Date();
  
  await this.checkSuspiciousActivity();
  return this.save();
};

/**
 * Get usage summary for dashboard
 */
apiKeySchema.methods.getUsageSummary = function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    keyName: this.name,
    status: this.status,
    isValid: this.isValid(),
    createdAt: this.createdAt,
    expiresAt: this.expiresAt,
    lastUsedAt: this.usageStats.lastUsedAt,
    totalRequests: this.usageStats.totalRequests,
    totalErrors: this.usageStats.totalErrors,
    errorRate:
      this.usageStats.totalRequests > 0
        ? (this.usageStats.totalErrors / this.usageStats.totalRequests) * 100
        : 0,
    totalBytesTransferred: this.usageStats.totalBytesTransferred,
    monthlyRequests: this.usageStats.monthlyRequests,
    topEndpoints: this.endpointUsage
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 5)
      .map((e) => ({
        endpoint: e.endpoint,
        method: e.method,
        requests: e.requestCount,
        errors: e.errorCount,
        avgResponseTime: e.avgResponseTime,
      })),
    permissions: this.permissions,
    rateLimitConfig: this.rateLimit,
  };
};

// ==================== MIDDLEWARE ====================

// Validate permissions before save
apiKeySchema.pre('save', function(next) {
  // If admin:all is set, remove other permissions
  if (this.permissions.includes('admin:all')) {
    this.permissions = ['admin:all'];
  }
  
  // Validate expiration date
  if (this.expiresAt && this.expiresAt <= new Date()) {
    this.status = 'expired';
  }
  
  next();
});

// Auto-populate user and team info
apiKeySchema.pre('findOne', function() {
  this.populate(['userId', 'teamId']);
});

apiKeySchema.pre('find', function() {
  this.populate(['userId', 'teamId']);
});

export default mongoose.model('ApiKey', apiKeySchema);
