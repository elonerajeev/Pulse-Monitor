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
      valid_from: Date,
      valid_to: Date,
      daysUntilExpiry: Number,
    },
    responseBody: String,
    error: {
      message: String,
      code: String,
    },
    requests: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const MonitoringLog = mongoose.model("MonitoringLog", monitoringLogSchema);
