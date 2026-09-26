import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";
import MaintenanceWindow from "../models/maintenanceWindow.model.js";
import Notification from "../models/notification.model.js";
import { sendAlert } from "./alertService.js";

/** Statuses that mean the monitor is not serving correctly. */
const DOWN_STATUSES = new Set(["offline", "down", "error"]);

export const getAllMonitoringServices = async () => {
  const services = await Monitoring.find({});
  return services;
};

/** Monitors this worker should actually probe — paused ones are skipped. */
export const getActiveMonitoringServices = async () => {
  const services = await Monitoring.find({ isPaused: { $ne: true } });
  return services;
};

export const saveMonitoringResult = async (monitoringId, result) => {
  const newLog = new MonitoringLog({
    monitoringId,
    ...result,
  });
  await newLog.save();

  return newLog;
};

/**
 * True when planned maintenance covers this moment, in which case a failure is
 * expected and must not page anyone.
 */
export const isUnderMaintenance = async (serviceId, now = new Date()) => {
  const active = await MaintenanceWindow.findOne({
    serviceId,
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now },
  }).lean();

  return Boolean(active);
};

/** Builds the $set fragment recording the certificate seen on this check. */
const sslSnapshotFields = (ssl, now) => {
  if (!ssl) return {};
  return {
    "ssl.issuer": ssl.issuerName || null,
    "ssl.validFrom": ssl.validFrom ? new Date(ssl.validFrom) : null,
    "ssl.validTo": ssl.validTo ? new Date(ssl.validTo) : null,
    "ssl.daysUntilExpiry": ssl.daysUntilExpiry ?? null,
    "ssl.lastCheckedAt": now,
  };
};

/**
 * Applies one observation to a monitor and decides whether anything is worth
 * announcing.
 *
 * The rules, in order:
 *
 *  1. Confirmation — a status only flips after N consecutive matching checks.
 *     One failed probe is far more often a network blip than an outage, and
 *     alerting on blips is how people learn to ignore alerts entirely.
 *  2. Compare-and-swap — the status transition is claimed atomically, so two
 *     regions observing the same outage announce it exactly once.
 *  3. Maintenance — a failure inside a planned window is expected, and is
 *     recorded without alerting.
 *  4. Cooldown — a repeat alert for a status already alerted on is dropped
 *     until the cooldown expires. A recovery always gets through, because
 *     leaving someone believing a service is still down is the worse failure.
 *
 * Returns a descriptor of what happened, which the caller logs.
 */
export const updateMonitoringStatus = async (monitoringId, observedStatus, result = {}) => {
  const now = new Date();
  const isDown = DOWN_STATUSES.has(observedStatus);

  const counters = isDown
    ? {
        $inc: { "health.consecutiveFailures": 1 },
        $set: {
          "health.consecutiveSuccesses": 0,
          "health.lastObservedStatus": observedStatus,
          "health.lastCheckedAt": now,
          ...sslSnapshotFields(result.ssl, now),
        },
      }
    : {
        $inc: { "health.consecutiveSuccesses": 1 },
        $set: {
          "health.consecutiveFailures": 0,
          "health.lastObservedStatus": observedStatus,
          "health.lastCheckedAt": now,
          ...sslSnapshotFields(result.ssl, now),
        },
      };

  const monitoring = await Monitoring.findByIdAndUpdate(monitoringId, counters, {
    new: true,
  }).populate("owner");

  if (!monitoring) return { transitioned: false, reason: "not_found" };
  if (monitoring.isPaused) return { transitioned: false, reason: "paused" };

  const policy = monitoring.alerting || {};
  const confirmations = policy.confirmations ?? 2;
  const recoveryConfirmations = policy.recoveryConfirmations ?? 1;
  const health = monitoring.health || {};

  const previous = monitoring.status;
  let confirmed = previous;

  if (isDown && (health.consecutiveFailures ?? 0) >= confirmations) {
    confirmed = "offline";
  } else if (!isDown && (health.consecutiveSuccesses ?? 0) >= recoveryConfirmations) {
    confirmed = "online";
  }

  if (confirmed === previous) {
    return {
      transitioned: false,
      reason: "unconfirmed",
      status: previous,
      consecutiveFailures: health.consecutiveFailures ?? 0,
      confirmations,
    };
  }

  // Claim the transition. The guard on the previous status means a second
  // worker running the same check finds nothing to update and stays quiet.
  const claimed = await Monitoring.findOneAndUpdate(
    { _id: monitoringId, status: previous },
    { $set: { status: confirmed, "health.lastStatusChangeAt": now } },
    { new: true }
  );

  if (!claimed) {
    return { transitioned: false, reason: "already_announced", status: confirmed };
  }

  const user = monitoring.owner;
  if (!user) {
    return { transitioned: true, alerted: false, reason: "no_owner", status: confirmed };
  }

  // The in-app notification is the record of what happened, so it is written
  // even when the alert itself is suppressed.
  await Notification.create({
    userId: user._id,
    monitoringId: monitoring._id,
    message: `Your monitoring service '${monitoring.name}' is now ${confirmed}.`,
  });

  if (policy.enabled === false) {
    return { transitioned: true, alerted: false, reason: "alerting_disabled", status: confirmed };
  }

  if (await isUnderMaintenance(monitoring._id, now)) {
    return { transitioned: true, alerted: false, reason: "maintenance", status: confirmed };
  }

  // Claim the alert slot atomically. Matching on the cooldown here rather than
  // reading-then-writing means concurrent checks cannot both pass the gate.
  const cooldownMs = (policy.cooldownMinutes ?? 30) * 60 * 1000;
  const cutoff = new Date(now.getTime() - cooldownMs);

  const alertClaim = await Monitoring.findOneAndUpdate(
    {
      _id: monitoringId,
      $or: [
        { "health.lastAlertAt": null },
        { "health.lastAlertAt": { $exists: false } },
        // A different status than the one last alerted on is always news.
        { "health.lastAlertStatus": { $ne: confirmed } },
        { "health.lastAlertAt": { $lte: cutoff } },
      ],
    },
    { $set: { "health.lastAlertAt": now, "health.lastAlertStatus": confirmed } },
    { new: true }
  );

  if (!alertClaim) {
    return { transitioned: true, alerted: false, reason: "cooldown", status: confirmed };
  }

  await sendAlert(monitoring, confirmed, result, user, {
    // Respect the owner's email opt-out without muting their webhooks.
    email: user.notificationPrefs?.incidentEmails !== false,
    previousStatus: previous,
  });

  return { transitioned: true, alerted: true, status: confirmed, previousStatus: previous };
};

export const getMonitoringLogs = async (monitoringId, limit = 200) => {
  const logs = await MonitoringLog.find({ monitoringId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 1000));
  return logs;
};

/**
 * Removes logs whose monitor no longer exists.
 *
 * Age-based expiry is handled by the TTL index on the collection; this only
 * sweeps up orphans left behind when a monitor is deleted without its logs.
 */
export const deleteOldMonitoringLogs = async () => {
  const liveIds = await Monitoring.find({}).select("_id").lean();
  const result = await MonitoringLog.deleteMany({
    monitoringId: { $nin: liveIds.map((m) => m._id) },
  });
  return { deletedCount: result.deletedCount ?? 0 };
};
