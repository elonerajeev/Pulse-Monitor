/**
 * Incident Model
 * Tracks outages, incidents, and root cause analysis
 */

import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    // Reference to monitoring service
    monitoringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitoring',
      required: true,
      index: true,
    },

    // User who owns this service
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Incident information
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 200,
    },

    description: String,

    // Incident severity
    severity: {
      type: String,
      enum: ['critical', 'major', 'minor', 'info'],
      default: 'major',
    },

    // Incident status
    status: {
      type: String,
      enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      default: 'investigating',
    },

    // Timeline events
    timeline: [
      {
        timestamp: { type: Date, default: Date.now },
        event: String, // Description of what happened
        type: {
          type: String,
          enum: ['detection', 'escalation', 'investigation', 'resolution', 'update'],
        },
        author: mongoose.Schema.Types.ObjectId,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    // Timing
    startTime: {
      type: Date,
      required: true,
    },

    detectedTime: Date, // When it was detected
    investigatedTime: Date, // When investigation started
    resolvedTime: Date, // When it was resolved

    // Duration
    duration: {
      investigation: Number, // milliseconds
      resolution: Number, // milliseconds
      totalDowntime: Number, // milliseconds
    },

    // Impact metrics
    impact: {
      affectedUsers: { type: Number, default: 0 },
      affectedRequests: { type: Number, default: 0 },
      affectedRegions: [String],
      estimatedCost: Number,
      slaBreach: { type: Boolean, default: false },
    },

    // Root Cause Analysis (RCA)
    rca: {
      rootCause: String, // Description of root cause
      contributingFactors: [String],
      resolution: String, // What was done to fix it
      permanentFix: {
        description: String,
        implemented: { type: Boolean, default: false },
        implementedDate: Date,
      },
      preventativeMeasures: [String],
    },

    // Alert and notification information
    alerts: [
      {
        channelType: String, // 'email', 'slack', 'sms', etc.
        recipient: String,
        sentTime: Date,
        status: String, // 'sent', 'failed', 'acknowledged'
      },
    ],

    // Affected endpoints/regions
    affectedEndpoints: [
      {
        url: String,
        statusCode: Number,
        errorRate: Number,
      },
    ],

    // Attachments/references
    attachments: [
      {
        type: String, // 'log', 'screenshot', 'report', etc.
        url: String,
        description: String,
      },
    ],

    // Communication/follow-up
    communication: {
      statusPageUpdated: { type: Boolean, default: false },
      customersNotified: { type: Boolean, default: false },
      postmortemScheduled: { type: Boolean, default: false },
      postmortemDate: Date,
      postmortemNotes: String,
    },

    // Team collaboration
    assignedTo: [mongoose.Schema.Types.ObjectId],
    watchers: [mongoose.Schema.Types.ObjectId],

    // Tags for categorization
    tags: [String],

    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // Related incidents
    relatedIncidents: [mongoose.Schema.Types.ObjectId],

    // Customer communication
    customerImpact: {
      visibility: { type: String, enum: ['internal', 'limited', 'public'] },
      statement: String,
      lastUpdate: Date,
    },

    // Metadata
    metadata: {
      source: String, // 'automated', 'manual', 'api', etc.
      version: { type: Number, default: 1 },
      archived: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: 'incidents',
  }
);

// Indexes
incidentSchema.index({ monitoringId: 1, startTime: -1 });
incidentSchema.index({ userId: 1, startTime: -1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ startTime: -1 });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
