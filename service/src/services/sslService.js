import { Monitoring } from "../models/monitoring.model.js";
import { sendSslAlert } from "./alertService.js";

const DEFAULT_THRESHOLDS = [30, 14, 7, 3, 1];
// Distinct marker for "already warned that the certificate has lapsed", kept
// separate from the day thresholds so an expiry warning fires exactly once.
const EXPIRED_BUCKET = 0;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Days until a certificate expires, recomputed from the stored expiry date. */
export const daysUntil = (validTo, now = new Date()) => {
  const expiry = new Date(validTo);
  if (Number.isNaN(expiry.getTime())) return null;
  return Math.ceil((expiry.getTime() - now.getTime()) / MS_PER_DAY);
};

/**
 * The threshold this certificate currently falls into: the tightest configured
 * warning it has crossed. Returns null while it is still comfortably valid.
 */
export const thresholdFor = (days, thresholds = DEFAULT_THRESHOLDS) => {
  if (days === null) return null;
  if (days <= 0) return EXPIRED_BUCKET;

  const crossed = thresholds
    .filter((t) => days <= t)
    .sort((a, b) => a - b);

  return crossed.length ? crossed[0] : null;
};

/**
 * Warns about certificates nearing expiry.
 *
 * Certificate dates are already captured on every check; until now nothing read
 * them. Expiry is recomputed from the stored date rather than trusting the
 * day-count captured at check time, so a monitor that stopped being checked
 * still reports the truth.
 *
 * Each monitor remembers the tightest threshold it has warned about, so the
 * sweep sends one warning per threshold crossed rather than one per day. A
 * renewed certificate clears that marker and re-arms the whole ladder.
 */
export const sweepCertificates = async (now = new Date()) => {
  const monitors = await Monitoring.find({
    isPaused: { $ne: true },
    "ssl.validTo": { $ne: null, $exists: true },
  }).populate("owner");

  const summary = { examined: monitors.length, warned: 0, rearmed: 0, skipped: 0 };

  for (const monitor of monitors) {
    const thresholds =
      monitor.alerting?.sslExpiryDays?.length
        ? [...monitor.alerting.sslExpiryDays]
        : DEFAULT_THRESHOLDS;

    const days = daysUntil(monitor.ssl.validTo, now);
    const bucket = thresholdFor(days, thresholds);
    const lastNotified = monitor.ssl.lastNotifiedThreshold;

    // Keep the recomputed figure visible to the dashboard and the assistant.
    monitor.ssl.daysUntilExpiry = days;

    // Comfortably valid again — the certificate was renewed, so re-arm every
    // threshold for the new one.
    if (bucket === null) {
      if (lastNotified !== null && lastNotified !== undefined) {
        monitor.ssl.lastNotifiedThreshold = null;
        summary.rearmed += 1;
      }
      await monitor.save();
      continue;
    }

    // Only warn when the certificate has entered a tighter band than the one
    // already reported. Otherwise this would re-send every single day.
    const alreadyWarned =
      lastNotified !== null && lastNotified !== undefined && bucket >= lastNotified;

    if (alreadyWarned || monitor.alerting?.enabled === false || !monitor.owner) {
      summary.skipped += 1;
      await monitor.save();
      continue;
    }

    monitor.ssl.lastNotifiedThreshold = bucket;
    await monitor.save();

    await sendSslAlert(monitor, monitor.owner, {
      daysUntilExpiry: days,
      validTo: monitor.ssl.validTo,
      issuer: monitor.ssl.issuer,
    });

    summary.warned += 1;
  }

  return summary;
};
