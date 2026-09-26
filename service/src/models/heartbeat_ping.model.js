import mongoose, { Schema } from "mongoose";

/**
 * One recorded check-in. Kept as its own collection so a heartbeat's history can
 * be charted and audited, and expired by TTL so it cannot grow without bound.
 */
const heartbeatPingSchema = new Schema(
  {
    heartbeatId: {
      type: Schema.Types.ObjectId,
      ref: "Heartbeat",
      required: true,
      index: true,
    },
    state: {
      type: String,
      enum: ["start", "complete", "fail"],
      default: "complete",
    },
    // Optional client-supplied context. Free text, so both are length-capped.
    source: { type: String, trim: true, maxlength: 200 },
    message: { type: String, trim: true, maxlength: 1000 },
    // Runtime the caller reports for the job it just finished.
    durationMs: { type: Number, min: 0 },
    // How late this ping was against the expected deadline; negative is early.
    latenessSeconds: { type: Number },
  },
  { timestamps: true }
);

// Retention matches monitoring logs so both histories age out together.
const RETENTION_DAYS = Number(process.env.PULSE_LOG_RETENTION_DAYS) || 90;
heartbeatPingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 }
);

export const HeartbeatPing = mongoose.model("HeartbeatPing", heartbeatPingSchema);
export default HeartbeatPing;
