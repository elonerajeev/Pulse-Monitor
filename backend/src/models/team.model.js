/**
 * Team Model
 * Manages team organizations, members, and roles
 */

import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    // Team information
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },

    description: String,

    // Owner (creator) of the team
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Team plan
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },

    // Team members
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
        permissions: [String], // Specific permissions
        joinedDate: {
          type: Date,
          default: Date.now,
        },
        lastActive: Date,
        status: {
          type: String,
          enum: ['active', 'inactive', 'suspended'],
          default: 'active',
        },
        customTitle: String,
      },
    ],

    // Team settings
    settings: {
      visibility: {
        type: String,
        enum: ['private', 'internal', 'public'],
        default: 'private',
      },
      allowExternalIntegrations: { type: Boolean, default: true },
      requireApprovalForNewMembers: { type: Boolean, default: false },
      allowInvitationByMembers: { type: Boolean, default: true },
    },

    // Shared resources
    services: [
      {
        monitoringId: mongoose.Schema.Types.ObjectId,
        accessLevel: {
          type: String,
          enum: ['read', 'edit', 'admin'],
        },
        sharedBy: mongoose.Schema.Types.ObjectId,
        sharedDate: Date,
      },
    ],

    // Team invitations
    invitations: [
      {
        email: String,
        role: String,
        invitedBy: mongoose.Schema.Types.ObjectId,
        invitedDate: Date,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined'],
          default: 'pending',
        },
        expiresAt: Date,
      },
    ],

    // Team audit log
    auditLog: [
      {
        timestamp: { type: Date, default: Date.now },
        action: String, // 'member_added', 'role_changed', 'permission_granted', etc.
        actor: mongoose.Schema.Types.ObjectId,
        target: mongoose.Schema.Types.ObjectId,
        details: mongoose.Schema.Types.Mixed,
      },
    ],

    // Team billing
    billing: {
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      plan: String,
      seatsUsed: Number,
      seatsLimit: Number,
      billingEmail: String,
      nextBillingDate: Date,
    },

    // Team statistics
    statistics: {
      totalMembers: Number,
      totalServices: Number,
      totalAlerts: Number,
      monthlyUptime: Number,
    },

    // Team preferences
    preferences: {
      defaultAlertChannels: [String],
      timeZone: { type: String, default: 'UTC' },
      language: { type: String, default: 'en' },
      theme: { type: String, default: 'light' },
    },

    // Metadata
    metadata: {
      slackWorkspaceId: String,
      jiraProjectKey: String,
      githubTeamId: String,
      tags: [String],
    },

    // Enable/disable team
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'teams',
  }
);

// Indexes
teamSchema.index({ owner: 1 });
teamSchema.index({ name: 1 });
teamSchema.index({ 'members.userId': 1 });
teamSchema.index({ active: 1 });
teamSchema.index({ plan: 1 });

const Team = mongoose.model('Team', teamSchema);

export default Team;
