import mongoose, { Schema } from "mongoose";

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
    status: {
      type: String,
      enum: ["online", "offline", "degraded", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Monitoring = mongoose.model("Monitoring", monitoringSchema);