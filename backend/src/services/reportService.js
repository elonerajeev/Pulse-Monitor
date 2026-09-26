import mongoose from "mongoose";
import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "./emailService.js";

const DOWN_STATUSES = ["offline", "down", "error"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** A window with no checks reports null, not 100% — absence of data is not uptime. */
const percent = (up, total) =>
  total > 0 ? Number(((up / total) * 100).toFixed(2)) : null;

const formatPeriod = (since, until) => {
  const options = { day: "numeric", month: "short", timeZone: "UTC" };
  const from = since.toLocaleDateString("en-GB", options);
  const to = until.toLocaleDateString("en-GB", { ...options, year: "numeric" });
  return `${from} – ${to}`;
};

/**
 * Aggregates one account's uptime over a window.
 *
 * Incidents are counted as transitions into a down state rather than as a count
 * of failed checks: a four-hour outage is one incident, not forty-eight.
 */
export const buildReport = async (userId, { since, until } = {}) => {
  const windowEnd = until || new Date();
  const windowStart = since || new Date(windowEnd.getTime() - 7 * MS_PER_DAY);

  const monitors = await Monitoring.find({ owner: userId })
    .select("_id name target isPaused")
    .lean();

  if (monitors.length === 0) {
    return {
      monitors: [],
      monitorCount: 0,
      overallUptime: null,
      totalIncidents: 0,
      totalChecks: 0,
      period: formatPeriod(windowStart, windowEnd),
      since: windowStart,
      until: windowEnd,
    };
  }

  const stats = await MonitoringLog.aggregate([
    {
      $match: {
        monitoringId: { $in: monitors.map((m) => new mongoose.Types.ObjectId(m._id)) },
        createdAt: { $gte: windowStart, $lt: windowEnd },
      },
    },
    {
      // Looking one row back per monitor is what makes a run of failures
      // collapse into a single incident.
      $setWindowFields: {
        partitionBy: "$monitoringId",
        sortBy: { createdAt: 1 },
        output: {
          prevStatus: { $shift: { output: "$status", by: -1, default: null } },
        },
      },
    },
    {
      $group: {
        _id: "$monitoringId",
        checks: { $sum: 1 },
        up: { $sum: { $cond: [{ $eq: ["$status", "online"] }, 1, 0] } },
        avgResponseTime: { $avg: "$responseTime" },
        incidents: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", DOWN_STATUSES] },
                  { $eq: ["$prevStatus", "online"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const byId = new Map(stats.map((s) => [String(s._id), s]));

  const rows = monitors.map((monitor) => {
    const stat = byId.get(String(monitor._id));
    return {
      id: String(monitor._id),
      name: monitor.name,
      target: monitor.target,
      isPaused: Boolean(monitor.isPaused),
      checks: stat?.checks ?? 0,
      uptime: percent(stat?.up ?? 0, stat?.checks ?? 0),
      avgResponseTime: stat?.avgResponseTime ?? null,
      incidents: stat?.incidents ?? 0,
    };
  });

  const totalChecks = rows.reduce((sum, r) => sum + r.checks, 0);
  const totalUp = stats.reduce((sum, s) => sum + s.up, 0);

  return {
    monitors: rows,
    monitorCount: rows.length,
    overallUptime: percent(totalUp, totalChecks),
    totalIncidents: rows.reduce((sum, r) => sum + r.incidents, 0),
    totalChecks,
    period: formatPeriod(windowStart, windowEnd),
    since: windowStart,
    until: windowEnd,
  };
};

/** Emails one account's report. Returns the send result. */
export const sendReport = async (user, report) =>
  sendEmail(user.email, `PulseMonitor: weekly uptime report`, "weeklyReport", {
    userName: user.name,
    ...report,
  });

/**
 * Sends the weekly digest to everyone who has not already had one recently.
 *
 * The recency guard is what makes this safe to retry: a worker that restarts
 * mid-run resumes without re-sending to accounts already covered.
 */
export const runWeeklyReports = async (now = new Date()) => {
  const notSince = new Date(now.getTime() - 6 * MS_PER_DAY);

  const recipients = await User.find({
    "notificationPrefs.weeklyReport": { $ne: false },
    $or: [
      { lastWeeklyReportAt: null },
      { lastWeeklyReportAt: { $exists: false } },
      { lastWeeklyReportAt: { $lte: notSince } },
    ],
  }).select("_id name email notificationPrefs lastWeeklyReportAt");

  const summary = { candidates: recipients.length, sent: 0, skipped: 0, failed: 0 };

  for (const user of recipients) {
    // Claim this send before doing the work, so a concurrent worker skips it.
    const claimed = await User.findOneAndUpdate(
      {
        _id: user._id,
        $or: [
          { lastWeeklyReportAt: null },
          { lastWeeklyReportAt: { $exists: false } },
          { lastWeeklyReportAt: { $lte: notSince } },
        ],
      },
      { $set: { lastWeeklyReportAt: now } }
    );

    if (!claimed) {
      summary.skipped += 1;
      continue;
    }

    try {
      const report = await buildReport(user._id, { until: now });

      // An account with nothing to report gets no mail; an empty digest is
      // noise, and noise is what gets a sender filtered.
      if (report.monitorCount === 0) {
        summary.skipped += 1;
        continue;
      }

      const result = await sendReport(user, report);
      if (result.ok) summary.sent += 1;
      else summary.failed += 1;
    } catch (error) {
      console.error(`Weekly report failed for ${user._id}:`, error.message);
      summary.failed += 1;
    }
  }

  return summary;
};
