import mongoose from 'mongoose';

/**
 * Database Optimization Model
 * Tracks query performance, indexes, and caching strategies
 * Features:
 * - Query performance metrics
 * - Index recommendations
 * - Caching strategies
 * - Slow query logging
 * - Query optimization suggestions
 */

const databaseOptimizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Query metrics
    queryMetrics: [
      {
        timestamp: {
          type: Date,
          index: true,
        },
        queryHash: String, // Hash of the query
        collection: String,
        operation: String, // find, insert, update, delete, aggregate
        duration: Number, // milliseconds
        docsScanned: Number,
        docsReturned: Number,
        indexUsed: String,
        efficiency: Number, // docsReturned / docsScanned * 100
        executionPlan: mongoose.Schema.Types.Mixed,
        slow: Boolean, // true if duration > threshold
      },
    ],
    // Indexes
    indexes: [
      {
        collection: String,
        name: String,
        keys: [
          {
            field: String,
            order: Number, // 1 for ascending, -1 for descending
          },
        ],
        type: String, // btree, hash, geospatial, text, wildcard
        unique: Boolean,
        sparse: Boolean,
        ttl: Number, // For TTL indexes
        size: Number, // bytes
        entriesCount: Number,
        usage: {
          totalAccesses: Number,
          recentAccesses: Number,
          lastUsed: Date,
        },
        recommendations: [
          {
            type: String, // rebuild, drop, create
            reason: String,
            priority: {
              type: String,
              enum: ['low', 'medium', 'high', 'critical'],
            },
          },
        ],
      },
    ],
    // Caching strategies
    cachingStrategies: [
      {
        id: String,
        pattern: String, // Query pattern or collection name
        strategy: {
          type: String,
          enum: ['ttl', 'lru', 'lfu', 'invalidation', 'write_through'],
        },
        ttl: Number, // seconds
        maxEntries: Number,
        hitRate: Number, // percentage
        missRate: Number,
        size: Number, // bytes
        enabled: Boolean,
      },
    ],
    // Collection statistics
    collectionStats: [
      {
        name: String,
        sizeOnDisk: Number, // bytes
        documentsCount: Number,
        avgDocSize: Number,
        indexSizeOnDisk: Number,
        storageEngine: String,
        wiredTigerStats: mongoose.Schema.Types.Mixed,
      },
    ],
    // Performance analysis
    performance: {
      avgQueryTime: Number,
      p95QueryTime: Number,
      p99QueryTime: Number,
      slowQueriesCount: {
        type: Number,
        default: 0,
      },
      slowQueryThreshold: {
        type: Number,
        default: 100, // milliseconds
      },
      indexCoverageRate: Number, // percentage of queries using indexes
      missingIndexCount: Number,
    },
    // Slow query log
    slowQueryLog: [
      {
        timestamp: Date,
        query: String,
        duration: Number,
        collection: String,
        docsScanned: Number,
        docsReturned: Number,
        indexUsed: String,
        executionStats: mongoose.Schema.Types.Mixed,
        explanation: String,
        suggestedIndex: String,
      },
    ],
    // Index recommendations
    indexRecommendations: [
      {
        collection: String,
        fields: [String],
        reason: String, // "Missing index for query pattern", etc.
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
        },
        estimatedImprovement: Number, // percentage
        frequency: Number, // How often this query runs
        accepted: Boolean,
        createdAt: Date,
      },
    ],
    // Write optimization
    writeOptimization: {
      batchInsertOptimal: Boolean,
      bulkOperationsUsed: Boolean,
      indexWriteLag: Number, // milliseconds
      journalFlushFrequency: String,
    },
    // Connection pooling
    connectionPooling: {
      poolSize: Number,
      activeConnections: Number,
      idleConnections: Number,
      waitQueueSize: Number,
      connectionRecycleInterval: Number, // seconds
    },
    // Memory usage
    memoryUsage: {
      wiredTigerCacheSize: Number,
      workingSet: Number,
      pageInRate: Number,
      pageOutRate: Number,
    },
    // Replication lag (if applicable)
    replicationLag: {
      enabled: Boolean,
      lagSeconds: Number,
      oplogWindow: Number, // seconds
      primarySyncStatus: String,
      replicaStatus: [
        {
          host: String,
          status: String,
          optime: Date,
          lag: Number,
        },
      ],
    },
    // Last analysis
    lastAnalysis: Date,
    lastOptimization: Date,
    // Configuration
    config: {
      autoIndexing: Boolean,
      autoVacuum: Boolean,
      compressionEnabled: Boolean,
      profilerEnabled: Boolean,
      profilerLevel: Number, // 0, 1, or 2
    },
  },
  {
    timestamps: true,
    collection: 'databaseOptimization',
  }
);

// ==================== INDEXES ====================
databaseOptimizationSchema.index({ userId: 1 });
databaseOptimizationSchema.index({ 'queryMetrics.timestamp': -1 });
databaseOptimizationSchema.index({ 'slowQueryLog.timestamp': -1 });
databaseOptimizationSchema.index({ 'indexRecommendations.priority': 1 });

// ==================== METHODS ====================

/**
 * Record query metric
 */
databaseOptimizationSchema.methods.recordQuery = async function (query) {
  const queryHash = require('crypto')
    .createHash('sha256')
    .update(JSON.stringify(query))
    .digest('hex');

  const metric = {
    timestamp: new Date(),
    queryHash,
    collection: query.collection,
    operation: query.operation,
    duration: query.duration,
    docsScanned: query.docsScanned,
    docsReturned: query.docsReturned,
    indexUsed: query.indexUsed,
    efficiency: query.docsScanned
      ? (query.docsReturned / query.docsScanned) * 100
      : 100,
    executionPlan: query.executionPlan,
    slow: query.duration > this.performance.slowQueryThreshold,
  };

  this.queryMetrics.push(metric);

  // If slow, add to slow query log
  if (metric.slow) {
    this.slowQueryLog.push({
      timestamp: new Date(),
      query: JSON.stringify(query),
      duration: query.duration,
      collection: query.collection,
      docsScanned: query.docsScanned,
      docsReturned: query.docsReturned,
      indexUsed: query.indexUsed,
      executionStats: query.executionPlan,
    });

    this.performance.slowQueriesCount += 1;

    // Check if index recommendation needed
    if (!query.indexUsed && metric.efficiency < 50) {
      this.recommendIndex(query);
    }
  }

  // Keep only last 10000 queries
  if (this.queryMetrics.length > 10000) {
    this.queryMetrics = this.queryMetrics.slice(-10000);
  }

  return this.save();
};

/**
 * Recommend index for inefficient query
 */
databaseOptimizationSchema.methods.recommendIndex = async function (query) {
  const recommendation = {
    collection: query.collection,
    fields: query.filters || [],
    reason: `Missing index for ${query.collection} query pattern`,
    priority: query.docsScanned > 100000 ? 'critical' : 'high',
    frequency: 1,
    accepted: false,
    createdAt: new Date(),
  };

  // Check if recommendation already exists
  const existing = this.indexRecommendations.find(
    (r) =>
      r.collection === recommendation.collection &&
      JSON.stringify(r.fields) === JSON.stringify(recommendation.fields)
  );

  if (existing) {
    existing.frequency += 1;
  } else {
    this.indexRecommendations.push(recommendation);
  }

  return this;
};

/**
 * Analyze performance
 */
databaseOptimizationSchema.methods.analyzePerformance = function () {
  if (this.queryMetrics.length === 0) return;

  const durations = this.queryMetrics.map((m) => m.duration).sort((a, b) => a - b);
  const length = durations.length;

  this.performance.avgQueryTime =
    durations.reduce((sum, d) => sum + d, 0) / length;

  this.performance.p95QueryTime = durations[Math.floor(length * 0.95)];
  this.performance.p99QueryTime = durations[Math.floor(length * 0.99)];

  const queriesWithIndex = this.queryMetrics.filter((m) => m.indexUsed).length;
  this.performance.indexCoverageRate = (queriesWithIndex / length) * 100;

  this.lastAnalysis = new Date();

  return this;
};

/**
 * Get index recommendations
 */
databaseOptimizationSchema.methods.getRecommendations = function (limit = 10) {
  return this.indexRecommendations
    .filter((r) => !r.accepted)
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, limit);
};

/**
 * Apply index recommendation
 */
databaseOptimizationSchema.methods.applyRecommendation = async function (
  recommendationId
) {
  const recommendation = this.indexRecommendations.find(
    (r) => r._id.equals(recommendationId)
  );

  if (recommendation) {
    recommendation.accepted = true;
    recommendation.createdAt = new Date();

    // In production, this would actually create the index
    this.lastOptimization = new Date();
  }

  return this.save();
};

/**
 * Get slow queries
 */
databaseOptimizationSchema.methods.getSlowQueries = function (limit = 50) {
  return this.slowQueryLog
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

/**
 * Get query statistics by collection
 */
databaseOptimizationSchema.methods.getCollectionStats = function (collection) {
  const queries = this.queryMetrics.filter((m) => m.collection === collection);

  if (queries.length === 0) return null;

  return {
    collection,
    totalQueries: queries.length,
    avgDuration: queries.reduce((sum, q) => sum + q.duration, 0) / queries.length,
    slowQueries: queries.filter((q) => q.slow).length,
    indexCoverage: (
      (queries.filter((q) => q.indexUsed).length / queries.length) *
      100
    ).toFixed(2),
  };
};

/**
 * Optimize database
 */
databaseOptimizationSchema.methods.optimize = async function () {
  this.analyzePerformance();
  this.lastOptimization = new Date();

  // Get recommendations
  const recommendations = this.getRecommendations(5);

  return {
    analyzed: true,
    recommendations,
    performance: this.performance,
  };
};

export default mongoose.model('DatabaseOptimization', databaseOptimizationSchema);
