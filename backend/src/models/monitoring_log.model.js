import mongoose, { Schema } from "mongoose";

const monitoringLogSchema = new Schema(
  {
    monitoringId: {
      type: Schema.Types.ObjectId,
      ref: "Monitoring",
      required: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "pending", "error"],
      default: "pending",
    },
    statusCode: {
      type: Number,
    },
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
      validFrom: String,
      validTo: String,
      daysUntilExpiry: Number,
    },
    responseBody: {
        type: String,
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

export const MonitoringLog = mongoose.model("MonitoringLog", monitoringLogSchema);
