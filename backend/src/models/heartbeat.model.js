import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

/**
 * A heartbeat is an inverted monitor: instead of probing a target, it waits for
 * the target to check in, and alerts when the check-in does not arrive. That is
 * the only way to watch work an external prober cannot reach — cron jobs,
 * nightly backups, queue consumers, ETL runs.
 */
const heartbeatSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Heartbeat name is required"],
      trim: true,
      maxlength: [100, "Name must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The secret embedded in the ping URL. It is the only credential a cron job
    // needs, so it is generated server-side and never derived from the name.
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // How often the job is expected to check in.
    expectedIntervalMinutes: {
      type: Number,
      required: [true, "Expected interval is required"],
      min: [1, "Expected interval must be at least 1 minute"],
      max: [43200, "Expected interval cannot exceed 30 days"],
      default: 60,
    },
    // Slack before a late check-in counts as missed, so a job that normally runs
    // a little long does not page anyone.
    graceMinutes: {
      type: Number,
      default: 5,
      min: [0, "Grace period cannot be negative"],
      max: [1440, "Grace period cannot exceed a day"],
    },
    status: {
      type: String,
      enum: ["pending", "up", "down"],
      default: "pending",
    },
    lastPingAt: { type: Date },
    // Optional label the caller sends with a ping (hostname, job run id). Free
    // text supplied by the client, so it is length-capped and never trusted.
    lastPingSource: { type: String, trim: true, maxlength: 200 },
    lastPingState: {
      type: String,
      enum: ["start", "complete", "fail"],
    },
    totalPings: { type: Number, default: 0 },
    // When the current down period began — drives the "missed for N minutes"
    // line in alerts.
    downSince: { type: Date },
    alerting: {
      enabled: { type: Boolean, default: true },
      cooldownMinutes: {
        type: Number,
        default: 30,
        min: [0, "Cooldown cannot be negative"],
        max: [1440, "Cooldown cannot exceed a day"],
      },
    },
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
    health: {
      lastAlertAt: { type: Date },
      lastAlertStatus: { type: String },
      lastStatusChangeAt: { type: Date },
    },
    isPaused: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// The overdue sweep scans for active heartbeats whose deadline has passed.
heartbeatSchema.index({ isPaused: 1, lastPingAt: 1 });

/** Generates a URL-safe ping token with 128 bits of entropy. */
export const generateHeartbeatToken = () => crypto.randomBytes(16).toString("hex");

/**
 * The moment after which this heartbeat counts as missed. A heartbeat that has
 * never been pinged is measured from when it was created, so a job that never
 * runs at all is still caught.
 */
heartbeatSchema.methods.dueAt = function dueAt() {
  const anchor = this.lastPingAt || this.createdAt;
  const windowMs = (this.expectedIntervalMinutes + this.graceMinutes) * 60 * 1000;
  return new Date(anchor.getTime() + windowMs);
};

export const Heartbeat = mongoose.model("Heartbeat", heartbeatSchema);
export default Heartbeat;
