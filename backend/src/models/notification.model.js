import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // What produced this entry. Heartbeats have no monitor, so the source id is
    // whichever of these applies rather than a single required field.
    kind: {
      type: String,
      enum: ["monitor", "heartbeat", "ssl"],
      default: "monitor",
    },
    monitoringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Monitoring",
    },
    heartbeatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heartbeat",
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// An entry that points at nothing cannot be rendered or linked, so require a
// source rather than storing an orphan.
notificationSchema.pre("validate", function requireSource(next) {
  if (!this.monitoringId && !this.heartbeatId) {
    return next(new Error("A notification must reference a monitor or a heartbeat"));
  }
  next();
});

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
