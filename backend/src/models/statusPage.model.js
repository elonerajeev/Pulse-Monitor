import mongoose from 'mongoose';

/**
 * Status Page Model
 * Public status pages for customer communication
 * Features:
 * - Component grouping
 * - Scheduled maintenance
 * - Subscriber notifications
 * - Custom branding
 * - History tracking
 */

const statusPageSchema = new mongoose.Schema(
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
    // Public URL
    publicUrl: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    // Branding
    branding: {
      companyName: String,
      logo: String, // S3 URL
      favicon: String, // S3 URL
      primaryColor: String,
      secondaryColor: String,
      backgroundColor: String,
      customCSS: String,
      customDomain: String, // custom.status.com
    },
    // Components (services)
    components: [
      {
        id: String,
        name: String,
        description: String,
        status: {
          type: String,
          enum: ['operational', 'degraded', 'partial_outage', 'major_outage'],
          default: 'operational',
        },
        group: String, // Component group name
        showUptime: Boolean,
        uptime: {
          type: Number,
          default: 100, // percentage
        },
        monitoringServiceId: mongoose.Schema.Types.ObjectId,
      },
    ],
    // Component groups
    componentGroups: [
      {
        id: String,
        name: String,
        description: String,
        components: [String], // Component IDs
      },
    ],
    // Incidents
    incidents: [
      {
        id: String,
        title: String,
        status: {
          type: String,
          enum: ['investigating', 'identified', 'monitoring', 'resolved'],
          default: 'investigating',
        },
        severity: {
          type: String,
          enum: ['minor', 'major', 'critical'],
        },
        impact: String, // "Affecting customers in US region", etc.
        description: String,
        updates: [
          {
            status: String,
            message: String,
            timestamp: Date,
            affectedComponents: [String], // Component IDs
          },
        ],
        createdAt: Date,
        resolvedAt: Date,
        incidentId: mongoose.Schema.Types.ObjectId, // Link to incident model
      },
    ],
    // Scheduled maintenance
    maintenanceWindows: [
      {
        id: String,
        title: String,
        description: String,
        status: {
          type: String,
          enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
          default: 'scheduled',
        },
        startTime: Date,
        estimatedEndTime: Date,
        actualEndTime: Date,
        affectedComponents: [String], // Component IDs
        impact: String,
        notes: String,
      },
    ],
    // Metrics & statistics
    metrics: {
      uptime: {
        day: Number,
        week: Number,
        month: Number,
        year: Number,
      },
      mttr: Number, // Mean time to recovery (hours)
      incidents: {
        thisMonth: Number,
        thisYear: Number,
      },
      lastUpdated: Date,
    },
    // Subscriber management
    subscribers: {
      enabled: Boolean,
      count: Number,
      subscriptions: [
        {
          email: String,
          status: {
            type: String,
            enum: ['active', 'unsubscribed'],
          },
          subscribedAt: Date,
          unsubscribedAt: Date,
          components: [String], // Components they're subscribed to
          digest: {
            type: String,
            enum: ['realtime', 'daily', 'weekly'],
            default: 'realtime',
          },
        },
      ],
    },
    // Notification settings
    notifications: {
      enabled: Boolean,
      channels: [
        {
          type: String,
          enum: ['email', 'sms', 'slack', 'webhook'],
        },
      ],
      sendOn: [
        {
          type: String,
          enum: ['incident_created', 'incident_updated', 'incident_resolved', 'maintenance_scheduled'],
        },
      ],
    },
    // Performance & uptime data
    uptimeHistory: [
      {
        timestamp: {
          type: Date,
          index: true,
        },
        componentId: String,
        status: String,
        responseTime: Number,
      },
    ],
    // Page settings
    settings: {
      showAffectedServices: Boolean,
      showUptime: Boolean,
      showMetrics: Boolean,
      publicHistoryLimit: Number, // Days to show in history
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
    },
    // Access control
    access: {
      public: Boolean,
      requirePassword: Boolean,
      password: String, // Hashed
    },
    // Analytics
    analytics: {
      visits: Number,
      lastVisit: Date,
      subscriberGrowth: [
        {
          date: Date,
          count: Number,
        },
      ],
    },
    // Status
    enabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'statusPages',
  }
);

// ==================== INDEXES ====================
statusPageSchema.index({ userId: 1 });
statusPageSchema.index({ slug: 1 });
statusPageSchema.index({ publicUrl: 1 });
statusPageSchema.index({ customDomain: 1 });
statusPageSchema.index({ 'incidents.createdAt': -1 });
statusPageSchema.index({ 'subscribers.email': 1 });

// ==================== METHODS ====================

/**
 * Add incident
 */
statusPageSchema.methods.addIncident = async function (incidentData) {
  const incident = {
    id: `inc_${Date.now()}`,
    ...incidentData,
    createdAt: new Date(),
  };

  this.incidents.push(incident);

  // Notify subscribers
  if (this.notifications.enabled) {
    await this.notifySubscribers(incident, 'incident_created');
  }

  return this.save();
};

/**
 * Update incident
 */
statusPageSchema.methods.updateIncident = async function (incidentId, updates) {
  const incident = this.incidents.find((i) => i.id === incidentId);

  if (!incident) {
    throw new Error('Incident not found');
  }

  Object.assign(incident, updates);

  // Add update to incident updates array
  if (updates.status) {
    incident.updates.push({
      status: updates.status,
      message: updates.message || '',
      timestamp: new Date(),
      affectedComponents: incident.affectedComponents,
    });
  }

  // Update component status based on incident
  if (updates.affectedComponents) {
    updates.affectedComponents.forEach((compId) => {
      const component = this.components.find((c) => c.id === compId);
      if (component && updates.status) {
        if (updates.status === 'resolved') {
          component.status = 'operational';
        } else if (updates.status === 'identified') {
          component.status = 'degraded';
        }
      }
    });
  }

  // Mark as resolved
  if (updates.status === 'resolved' && !incident.resolvedAt) {
    incident.resolvedAt = new Date();
  }

  // Notify subscribers
  if (this.notifications.enabled) {
    await this.notifySubscribers(incident, 'incident_updated');
  }

  return this.save();
};

/**
 * Schedule maintenance
 */
statusPageSchema.methods.scheduleMaintenance = async function (maintenanceData) {
  const maintenance = {
    id: `maint_${Date.now()}`,
    status: 'scheduled',
    ...maintenanceData,
  };

  this.maintenanceWindows.push(maintenance);

  // Notify subscribers
  if (this.notifications.enabled) {
    await this.notifySubscribers(maintenance, 'maintenance_scheduled');
  }

  return this.save();
};

/**
 * Add subscriber
 */
statusPageSchema.methods.addSubscriber = async function (email, components = []) {
  const existing = this.subscribers.subscriptions.find((s) => s.email === email);

  if (!existing) {
    this.subscribers.subscriptions.push({
      email,
      status: 'active',
      subscribedAt: new Date(),
      components,
      digest: 'realtime',
    });
    this.subscribers.count += 1;
  }

  return this.save();
};

/**
 * Unsubscribe
 */
statusPageSchema.methods.unsubscribe = async function (email) {
  const subscription = this.subscribers.subscriptions.find((s) => s.email === email);

  if (subscription) {
    subscription.status = 'unsubscribed';
    subscription.unsubscribedAt = new Date();
    this.subscribers.count = Math.max(0, this.subscribers.count - 1);
  }

  return this.save();
};

/**
 * Get active incidents
 */
statusPageSchema.methods.getActiveIncidents = function () {
  return this.incidents.filter(
    (i) => i.status !== 'resolved'
  );
};

/**
 * Get incident history
 */
statusPageSchema.methods.getIncidentHistory = function (days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.incidents.filter((i) => new Date(i.createdAt) >= cutoff);
};

/**
 * Calculate uptime
 */
statusPageSchema.methods.calculateUptime = function (period = 'month') {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const relevantIncidents = this.incidents.filter(
    (i) => new Date(i.createdAt) >= startDate && i.resolvedAt
  );

  const totalDowntime = relevantIncidents.reduce((sum, i) => {
    return sum + (new Date(i.resolvedAt) - new Date(i.createdAt));
  }, 0);

  const totalTime = now - startDate;
  const uptime = ((totalTime - totalDowntime) / totalTime) * 100;

  return Math.max(0, Math.min(100, uptime));
};

/**
 * Notify subscribers
 */
statusPageSchema.methods.notifySubscribers = async function (data, eventType) {
  // Implementation would send notifications via configured channels
  // This is a placeholder for the actual notification service
  console.log(`[Status Page] Notifying subscribers of ${eventType}`);
};

export default mongoose.model('StatusPage', statusPageSchema);
