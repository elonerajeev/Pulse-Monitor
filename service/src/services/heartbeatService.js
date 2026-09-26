import { Heartbeat } from "../models/heartbeat.model.js";
import { HeartbeatPing } from "../models/heartbeat_ping.model.js";
import Notification from "../models/notification.model.js";
import { sendHeartbeatAlert } from "./alertService.js";

const MS_PER_MINUTE = 60 * 1000;

/** "2h 15m" — used in alert copy, so it favours readability over precision. */
export const formatDuration = (ms) => {
  if (!Number.isFinite(ms) || ms <= 0) return "0m";
  const totalMinutes = Math.floor(ms / MS_PER_MINUTE);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return [days ? `${days}d` : null, hours ? `${hours}h` : null, `${minutes}m`]
    .filter(Boolean)
    .join(" ");
};

/** The instant this heartbeat becomes overdue. */
export const dueAt = (heartbeat) => {
  const anchor = heartbeat.lastPingAt || heartbeat.createdAt;
  const windowMs =
    (heartbeat.expectedIntervalMinutes + (heartbeat.graceMinutes ?? 0)) * MS_PER_MINUTE;
  return new Date(new Date(anchor).getTime() + windowMs);
};

/**
 * Claims the right to alert for this heartbeat, honouring its cooldown.
 *
 * Written as a conditional update so two workers sweeping at the same second
 * cannot both send. A state different from the last one alerted on always wins,
 * so a recovery is never swallowed by the cooldown of the preceding failure.
 */
const claimAlert = async (heartbeatId, state, cooldownMinutes, now) => {
  const cutoff = new Date(now.getTime() - (cooldownMinutes ?? 30) * MS_PER_MINUTE);

  const claimed = await Heartbeat.findOneAndUpdate(
    {
      _id: heartbeatId,
      $or: [
        { "health.lastAlertAt": null },
        { "health.lastAlertAt": { $exists: false } },
        { "health.lastAlertStatus": { $ne: state } },
        { "health.lastAlertAt": { $lte: cutoff } },
      ],
    },
    { $set: { "health.lastAlertAt": now, "health.lastAlertStatus": state } }
  );

  return Boolean(claimed);
};

const notify = async (heartbeat, message) => {
  await Notification.create({
    userId: heartbeat.owner?._id || heartbeat.owner,
    kind: "heartbeat",
    heartbeatId: heartbeat._id,
    message,
  });
};

/**
 * Records a check-in.
 *
 * `state` distinguishes a job that has started from one that finished, and lets
 * a job report its own failure — a wrapper script that exits non-zero can call
 * in with state=fail and page immediately rather than waiting to be missed.
 */
export const recordPing = async (token, payload = {}) => {
  const heartbeat = await Heartbeat.findOne({ token }).populate("owner");
  if (!heartbeat) return { found: false };

  const now = new Date();
  const state = ["start", "complete", "fail"].includes(payload.state)
    ? payload.state
    : "complete";

  const deadline = dueAt(heartbeat);
  const latenessSeconds = Math.round((now.getTime() - deadline.getTime()) / 1000);

  await HeartbeatPing.create({
    heartbeatId: heartbeat._id,
    state,
    source: payload.source,
    message: payload.message,
    durationMs: payload.durationMs,
    latenessSeconds,
  });

  const previousStatus = heartbeat.status;
  // A "start" ping proves the job is alive, so it resets the clock, but it does
  // not claim success — only a completion can mark the heartbeat healthy.
  const nextStatus = state === "fail" ? "down" : state === "start" ? previousStatus : "up";

  const update = {
    $set: {
      lastPingAt: now,
      lastPingState: state,
      lastPingSource: payload.source,
      status: nextStatus,
    },
    $inc: { totalPings: 1 },
  };

  if (nextStatus === "down" && previousStatus !== "down") {
    update.$set.downSince = now;
    update.$set["health.lastStatusChangeAt"] = now;
  } else if (nextStatus === "up" && previousStatus !== "up") {
    update.$set.downSince = null;
    update.$set["health.lastStatusChangeAt"] = now;
  }

  await Heartbeat.updateOne({ _id: heartbeat._id }, update);

  const changed = nextStatus !== previousStatus;
  let alerted = false;

  if (
    changed &&
    !heartbeat.isPaused &&
    heartbeat.alerting?.enabled !== false &&
    heartbeat.owner &&
    // A first successful check-in is the heartbeat starting to work, not a
    // recovery from an outage, so it is not worth an email.
    !(nextStatus === "up" && previousStatus === "pending")
  ) {
    const claimedAlert = await claimAlert(
      heartbeat._id,
      nextStatus,
      heartbeat.alerting?.cooldownMinutes,
      now
    );

    if (claimedAlert) {
      await sendHeartbeatAlert(heartbeat, heartbeat.owner, nextStatus, {
        message: payload.message,
      });
      alerted = true;
    }
  }

  if (changed) {
    await notify(heartbeat, `Heartbeat '${heartbeat.name}' is now ${nextStatus}.`);
  }

  return {
    found: true,
    heartbeat,
    state,
    previousStatus,
    status: nextStatus,
    changed,
    alerted,
  };
};

/**
 * Marks heartbeats that have gone quiet past their deadline.
 *
 * This is the whole point of a heartbeat: nothing arrives to trigger it, so
 * something has to come looking. Runs on a short cycle because a heartbeat's
 * resolution is bounded by how often this sweep runs.
 */
export const sweepHeartbeats = async (now = new Date()) => {
  const candidates = await Heartbeat.find({
    isPaused: { $ne: true },
    status: { $ne: "down" },
  }).populate("owner");

  const summary = { examined: candidates.length, missed: 0, alerted: 0 };

  for (const heartbeat of candidates) {
    const deadline = dueAt(heartbeat);
    if (now <= deadline) continue;

    // Guard on the status we read, so a check-in that lands mid-sweep wins and
    // this does not overwrite it with a stale "down".
    const claimed = await Heartbeat.findOneAndUpdate(
      { _id: heartbeat._id, status: heartbeat.status },
      {
        $set: {
          status: "down",
          downSince: heartbeat.downSince || deadline,
          "health.lastStatusChangeAt": now,
        },
      }
    );

    if (!claimed) continue;
    summary.missed += 1;

    await notify(heartbeat, `Heartbeat '${heartbeat.name}' missed its check-in.`);

    if (heartbeat.alerting?.enabled === false || !heartbeat.owner) continue;

    const claimedAlert = await claimAlert(
      heartbeat._id,
      "down",
      heartbeat.alerting?.cooldownMinutes,
      now
    );

    if (claimedAlert) {
      await sendHeartbeatAlert(heartbeat, heartbeat.owner, "down", {
        overdueBy: formatDuration(now.getTime() - deadline.getTime()),
      });
      summary.alerted += 1;
    }
  }

  return summary;
};

/**
 * Removes pings whose heartbeat has been deleted. The TTL index only expires
 * pings by age; a deleted heartbeat leaves its history behind until then.
 */
export const deleteOrphanedHeartbeatPings = async () => {
  const liveIds = await Heartbeat.find({}).select("_id").lean();
  const result = await HeartbeatPing.deleteMany({
    heartbeatId: { $nin: liveIds.map((h) => h._id) },
  });
  return { deletedCount: result.deletedCount ?? 0 };
};
