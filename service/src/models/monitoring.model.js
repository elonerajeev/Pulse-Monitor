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
      min: [5, "Interval must be at least 5 minutes"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    alertEmail: {
      type: String,
      trim: true,
    },
    alert: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'online', 'offline'],
      default: 'pending',
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Monitoring = mongoose.model("Monitoring", monitoringSchema);
