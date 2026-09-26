import mongoose from 'mongoose';

/**
 * Dashboard Model
 * Custom dashboards with widgets, real-time data, and sharing
 * Features:
 * - Widget system
 * - Real-time updates
 * - Custom metrics
 * - Sharing & permissions
 * - Layout customization
 */

const dashboardSchema = new mongoose.Schema(
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
    description: {
      type: String,
      maxlength: 1000,
    },
    // Dashboard type
    type: {
      type: String,
      enum: ['personal', 'team', 'public', 'template'],
      default: 'personal',
    },
    // Layout configuration
    layout: {
      columns: {
        type: Number,
        default: 4,
        min: 2,
        max: 6,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      refreshInterval: {
        type: Number,
        default: 30, // seconds
        min: 5,
        max: 3600,
      },
    },
    // Widgets
    widgets: [
      {
        id: String,
        type: {
          type: String,
          enum: [
            'metric_card',
            'chart_line',
            'chart_bar',
            'chart_pie',
            'table',
            'status_page',
            'heatmap',
            'gauge',
            'text',
            'alerts_list',
            'incidents_list',
            'sla_progress',
          ],
        },
        title: String,
        position: {
          x: Number,
          y: Number,
        },
        size: {
          width: Number, // 1-6 (in columns)
          height: Number, // 1-5
        },
        // Widget-specific config
        config: {
          // For metric cards
          metric: String, // responseTime, errorRate, uptime, etc.
          unit: String,
          format: String, // number, percentage, duration, bytes
          comparisonPeriod: String, // 1h, 24h, 7d
          
          // For charts
          chartType: String,
          xAxis: String,
          yAxis: String,
          series: [
            {
              name: String,
              metric: String,
              color: String,
              aggregation: String, // avg, sum, min, max, p95, p99
            },
          ],
          
          // For lists
          limit: Number,
          sortBy: String,
          sortOrder: String,
          filters: [
            {
              field: String,
              operator: String,
              value: mongoose.Schema.Types.Mixed,
            },
          ],
          
          // For gauges
          minValue: Number,
          maxValue: Number,
          warningThreshold: Number,
          criticalThreshold: Number,
          
          // For heatmap
          timeInterval: String, // hourly, daily, weekly
          
          // For status page
          hideResolved: Boolean,
          showDetails: Boolean,
        },
        // Data source
        dataSource: {
          type: {
            type: String,
            enum: ['monitoring', 'incidents', 'alerts', 'sla', 'custom_api'],
          },
          serviceIds: [mongoose.Schema.Types.ObjectId],
          customQuery: String, // For custom data sources
        },
        // Caching
        cache: {
          enabled: Boolean,
          ttl: Number, // seconds
        },
        // Display settings
        display: {
          showLegend: Boolean,
          showGrid: Boolean,
          showTooltip: Boolean,
          animated: Boolean,
        },
      },
    ],
    // Sharing settings
    sharing: {
      type: {
        type: String,
        enum: ['private', 'team', 'public'],
        default: 'private',
      },
      sharedWith: [
        {
          userId: mongoose.Schema.Types.ObjectId,
          role: {
            type: String,
            enum: ['viewer', 'editor', 'admin'],
          },
          grantedAt: Date,
          grantedBy: mongoose.Schema.Types.ObjectId,
        },
      ],
      publicLink: {
        token: String,
        expiresAt: Date,
      },
    },
    // Notifications
    notifications: {
      enabled: Boolean,
      frequency: String, // hourly, daily, weekly
      channels: [String], // email, slack, teams
      recipients: [String],
    },
    // Starred/Favorites
    isStarred: {
      type: Boolean,
      default: false,
    },
    // Auto-refresh
    autoRefresh: {
      type: Boolean,
      default: true,
    },
    // Tags
    tags: [String],
    // Metadata
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      lastViewed: Date,
      createdAt: Date,
    },
    // Draft/Published state
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'dashboards',
  }
);

// ==================== INDEXES ====================
dashboardSchema.index({ userId: 1, status: 1 });
dashboardSchema.index({ teamId: 1, status: 1 });
dashboardSchema.index({ 'sharing.type': 1 });
dashboardSchema.index({ 'sharing.sharedWith.userId': 1 });
dashboardSchema.index({ tags: 1 });
dashboardSchema.index({ isStarred: 1, userId: 1 });

// ==================== METHODS ====================

/**
 * Add widget to dashboard
 */
dashboardSchema.methods.addWidget = async function (widgetConfig) {
  const widget = {
    id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...widgetConfig,
  };

  this.widgets.push(widget);
  return this.save();
};

/**
 * Update widget
 */
dashboardSchema.methods.updateWidget = async function (widgetId, updates) {
  const widget = this.widgets.find((w) => w.id === widgetId);

  if (!widget) {
    throw new Error('Widget not found');
  }

  Object.assign(widget, updates);
  return this.save();
};

/**
 * Remove widget
 */
dashboardSchema.methods.removeWidget = async function (widgetId) {
  this.widgets = this.widgets.filter((w) => w.id !== widgetId);
  return this.save();
};

/**
 * Reorder widgets
 */
dashboardSchema.methods.reorderWidgets = async function (widgetOrder) {
  // widgetOrder is array of [{ id, x, y }]
  widgetOrder.forEach((order) => {
    const widget = this.widgets.find((w) => w.id === order.id);
    if (widget) {
      widget.position = { x: order.x, y: order.y };
    }
  });

  return this.save();
};

/**
 * Share dashboard
 */
dashboardSchema.methods.shareDashboard = async function (
  userId,
  role,
  grantedBy
) {
  const existingShare = this.sharing.sharedWith.find((s) =>
    s.userId.equals(userId)
  );

  if (existingShare) {
    existingShare.role = role;
  } else {
    this.sharing.sharedWith.push({
      userId,
      role,
      grantedAt: new Date(),
      grantedBy,
    });
  }

  return this.save();
};

/**
 * Revoke access
 */
dashboardSchema.methods.revokeAccess = async function (userId) {
  this.sharing.sharedWith = this.sharing.sharedWith.filter(
    (s) => !s.userId.equals(userId)
  );
  return this.save();
};

/**
 * Get accessible dashboards for user
 */
dashboardSchema.statics.getAccessibleDashboards = async function (userId) {
  return this.find({
    $or: [
      { userId }, // Owner
      { 'sharing.sharedWith.userId': userId }, // Shared with user
      { 'sharing.type': 'public' }, // Public dashboards
    ],
  });
};

/**
 * Duplicate dashboard
 */
dashboardSchema.methods.duplicate = async function (newName, userId) {
  const duplicated = new this.constructor({
    userId,
    name: newName || `${this.name} (Copy)`,
    description: this.description,
    layout: { ...this.layout },
    widgets: this.widgets.map((w) => ({
      ...w.toObject(),
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })),
    type: 'personal',
    status: 'draft',
    createdBy: userId,
  });

  return duplicated.save();
};

/**
 * Record view
 */
dashboardSchema.methods.recordView = async function () {
  this.stats.views += 1;
  this.stats.lastViewed = new Date();
  return this.save();
};

export default mongoose.model('Dashboard', dashboardSchema);
