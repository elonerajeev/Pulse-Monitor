import mongoose, { Schema } from "mongoose";

const monitoringLogSchema = new Schema(
  {
    monitoringId: {
      type: Schema.Types.ObjectId,
      ref: "Monitoring",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "pending", "down", "error"],
      default: "pending",
    },
    statusCode: Number,
    responseTime: {
      type: Number, // in milliseconds
    },
    // Which prober produced this result. The worker has always sent it; without
    // a field for it Mongoose dropped it on every write.
    region: String,
    timings: {
      dns: Number,
      tcp: Number,
      tls: Number,
      firstByte: Number,
      contentTransfer: Number,
      total: Number,
    },
    ssl: {
      subject: Object,
      issuer: Object,
      // camelCase to match what the prober emits. These were declared as
      // valid_from/valid_to, which silently discarded every certificate date.
      validFrom: Date,
      validTo: Date,
      daysUntilExpiry: Number,
    },
    responseBody: String,
    // Where the request ended up, and how many hops it took to get there.
    finalUrl: String,
    redirectCount: Number,
    error: {
      message: String,
      // Transport codes (ECONNREFUSED, ETIMEDOUT) plus the check's own verdicts
      // (UNEXPECTED_STATUS, ASSERTION_FAILED).
      code: String,
    },
    requests: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// The dashboard and every uptime aggregate read a single monitor's logs newest
// first; without this the query sorts the whole collection.
monitoringLogSchema.index({ monitoringId: 1, createdAt: -1 });

// Retention: logs age out after PULSE_LOG_RETENTION_DAYS (default 90). MongoDB
// expires them in the background, so history survives long enough for uptime
// and SLA reporting without unbounded growth.
const RETENTION_DAYS = Number(process.env.PULSE_LOG_RETENTION_DAYS) || 90;
monitoringLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 }
);

export const MonitoringLog = mongoose.model("MonitoringLog", monitoringLogSchema);
