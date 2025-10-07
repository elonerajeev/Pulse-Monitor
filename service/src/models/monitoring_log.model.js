
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
      enum: ["online", "offline", "pending"],
      default: "pending",
    },
    responseTime: {
      type: Number, // in milliseconds
    },
    ssl: {
      subject: String,
      issuer: String,
      valid_from: Date,
      valid_to: Date,
      daysUntilExpiry: Number,
    },
    error: {
      message: String,
      code: String,
    },
  },
  { timestamps: true }
);

export const MonitoringLog = mongoose.model("MonitoringLog", monitoringLogSchema);
