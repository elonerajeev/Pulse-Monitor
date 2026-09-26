import mongoose, { Schema } from "mongoose";

/**
 * Assertions turn "the server answered" into "the server answered correctly".
 * A hacked or half-deployed site happily returns 200 with the wrong body, so a
 * bare status check is not enough to call a service healthy.
 */
const assertionsSchema = new Schema(
  {
    // Exact status code the response must carry. Null means "any 2xx or 3xx".
    expectedStatusCode: {
      type: Number,
      default: null,
      min: [100, "Status code must be a valid HTTP status"],
      max: [599, "Status code must be a valid HTTP status"],
    },
    // Substring that must appear in the response body.
    mustContain: { type: String, trim: true, maxlength: 500 },
    // Substring that must NOT appear — catches error pages that still return 200.
    mustNotContain: { type: String, trim: true, maxlength: 500 },
    // Case-insensitive body matching.
    caseSensitive: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Alerting policy. The defaults exist to stop a single failed probe from paging
 * anyone: transient network blips are the overwhelming majority of one-off
 * failures, and alerting on them is how people learn to ignore alerts.
 */
const alertingSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    // Consecutive failed checks required before the monitor is declared down.
    confirmations: {
      type: Number,
      default: 2,
      min: [1, "At least one failed check is required"],
      max: [10, "More than 10 confirmations delays alerts too far"],
    },
    // Consecutive successful checks required before it is declared recovered.
    recoveryConfirmations: {
      type: Number,
      default: 1,
      min: [1, "At least one successful check is required"],
      max: [10, "More than 10 confirmations delays recovery too far"],
    },
    // Minimum gap between two alerts of the same status for this monitor.
    // A flapping service can otherwise send one alert per check interval.
    cooldownMinutes: {
      type: Number,
      default: 30,
      min: [0, "Cooldown cannot be negative"],
      max: [1440, "Cooldown cannot exceed a day"],
    },
    // Days-before-expiry at which to warn about the TLS certificate.
    sslExpiryDays: {
      type: [Number],
      default: [30, 14, 7, 3, 1],
    },
  },
  { _id: false }
);

/**
 * Rolling check state. Kept on the monitor rather than recomputed from logs so
 * the confirmation counters survive a worker restart and stay consistent when
 * more than one region reports on the same monitor.
 */
const healthSchema = new Schema(
  {
    consecutiveFailures: { type: Number, default: 0 },
    consecutiveSuccesses: { type: Number, default: 0 },
    lastObservedStatus: { type: String },
    lastCheckedAt: { type: Date },
    lastStatusChangeAt: { type: Date },
    // Which alert was last delivered, and when — together these implement the
    // per-status cooldown.
    lastAlertAt: { type: Date },
    lastAlertStatus: { type: String },
  },
  { _id: false }
);

/**
 * Latest TLS certificate observation, plus which expiry threshold has already
 * been warned about so the daily sweep does not re-send the same warning.
 */
const sslStateSchema = new Schema(
  {
    issuer: { type: String },
    validFrom: { type: Date },
    validTo: { type: Date },
    daysUntilExpiry: { type: Number },
    lastCheckedAt: { type: Date },
    lastNotifiedThreshold: { type: Number, default: null },
  },
  { _id: false }
);

const monitoringSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    target: {
      type: String,
      required: [true, "Target is required"],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      enum: ["website", "server"],
      default: "website",
    },
    interval: {
      type: Number,
      required: [true, "Check interval is required"],
      default: 5, // Default to 5 minutes
      min: [0.5, "Interval must be at least 0.5 minutes (30 seconds)"],
    },
    regions: {
      type: [String],
      default: ["us-east-1"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dependencies: [ // Added dependencies field
      {
        type: Schema.Types.ObjectId,
        ref: "Monitoring",
      },
    ],
    alertChannels: {
      slack: {
        enabled: { type: Boolean, default: false },
        webhookUrl: { type: String, trim: true },
      },
      discord: {
        enabled: { type: Boolean, default: false },
        webhookUrl: { type: String, trim: true },
      },
    },
    assertions: { type: assertionsSchema, default: () => ({}) },
    alerting: { type: alertingSchema, default: () => ({}) },
    health: { type: healthSchema, default: () => ({}) },
    ssl: { type: sslStateSchema, default: () => ({}) },
    // A paused monitor is not checked and cannot alert. Used for decommissioned
    // services and for planned work that outlasts a maintenance window.
    isPaused: {
      type: Boolean,
      default: false,
    },
    // Opt-in: only monitors explicitly marked public appear on the shared
    // status page or expose an uptime badge.
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["online", "offline", "degraded", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Monitoring = mongoose.model("Monitoring", monitoringSchema);
