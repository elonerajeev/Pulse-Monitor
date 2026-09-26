import mongoose from "mongoose";
import { Monitoring } from "../../models/monitoring.model.js";
import { MonitoringLog } from "../../models/monitoring_log.model.js";

// Tools the assistant can call to read the caller's own PulseMonitor data.
//
// Every executor takes the authenticated user and filters by `owner`, so a
// tool call can never reach another tenant's monitors — the model chooses
// which tool to run, never which account to read.

const DOWN_STATUSES = ["offline", "down", "error"];

export const pulseTools = [
  {
    name: "list_monitors",
    description:
      "List the monitors this user has configured, with their current status. " +
      "Use this first when the user asks about 'my services', 'my sites', or " +
      "refers to a monitor by a name you have not seen yet.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["online", "offline", "degraded", "pending"],
          description: "Only return monitors currently in this status.",
        },
      },
    },
  },
  {
    name: "get_monitor_stats",
    description:
      "Uptime percentage, check count, and response-time statistics for one " +
      "monitor over a time window. Also reports the latest SSL certificate " +
      "expiry seen for the monitor.",
    input_schema: {
      type: "object",
      properties: {
        monitor: {
          type: "string",
          description: "Monitor name or id. Names are matched case-insensitively.",
        },
        hours: {
          type: "number",
          description: "Size of the look-back window in hours. Defaults to 24.",
        },
      },
      required: ["monitor"],
    },
  },
  {
    name: "get_recent_incidents",
    description:
      "Failed checks (offline, down, or error) across all of this user's " +
      "monitors, newest first. Use for 'what went wrong', 'any outages', or " +
      "'why was X down' questions.",
    input_schema: {
      type: "object",
      properties: {
        hours: {
          type: "number",
          description: "Look-back window in hours. Defaults to 24.",
        },
        monitor: {
          type: "string",
          description: "Restrict to a single monitor, by name or id.",
        },
        limit: {
          type: "number",
          description: "Maximum incidents to return (1-50). Defaults to 20.",
        },
      },
    },
  },
  {
    name: "get_monitor_checks",
    description:
      "The most recent individual checks for one monitor — status, HTTP status " +
      "code, response time, and connection timing breakdown. Use when the user " +
      "asks about recent behaviour or slowness in detail.",
    input_schema: {
      type: "object",
      properties: {
        monitor: {
          type: "string",
          description: "Monitor name or id.",
        },
        limit: {
          type: "number",
          description: "Number of checks to return (1-50). Defaults to 20.",
        },
      },
      required: ["monitor"],
    },
  },
  {
    name: "get_account_summary",
    description:
      "This user's account details: name, email, plan, subscription status, " +
      "when they joined, and a count of their monitors by status.",
    input_schema: { type: "object", properties: {} },
  },
];

// Resolves a user-supplied monitor reference (id or name) to a monitor this
// user actually owns. Returns null when there is no match.
const resolveMonitor = async (reference, userId) => {
  if (typeof reference !== "string" || !reference.trim()) return null;
  const value = reference.trim();

  if (mongoose.isValidObjectId(value)) {
    const byId = await Monitoring.findOne({ _id: value, owner: userId });
    if (byId) return byId;
  }

  // Escape the name before it becomes a regex so a monitor called "api (v2)"
  // cannot break the query.
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Monitoring.findOne({
    owner: userId,
    name: { $regex: `^${escaped}$`, $options: "i" },
  });
};

const clamp = (value, min, max, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

const since = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

const executors = {
  list_monitors: async (input, user) => {
    const query = { owner: user._id };
    if (input.status) query.status = input.status;

    const monitors = await Monitoring.find(query)
      .select("name target serviceType interval status regions createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return {
      count: monitors.length,
      monitors: monitors.map((m) => ({
        id: String(m._id),
        name: m.name,
        target: m.target,
        type: m.serviceType,
        checkIntervalMinutes: m.interval,
        currentStatus: m.status,
        regions: m.regions,
        createdAt: m.createdAt,
      })),
    };
  },

  get_monitor_stats: async (input, user) => {
    const monitor = await resolveMonitor(input.monitor, user._id);
    if (!monitor) return { error: `No monitor named "${input.monitor}" on this account.` };

    const hours = clamp(input.hours, 1, 24 * 30, 24);
    const logs = await MonitoringLog.find({
      monitoringId: monitor._id,
      createdAt: { $gte: since(hours) },
    })
      .select("status responseTime statusCode ssl createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!logs.length) {
      return {
        monitor: monitor.name,
        windowHours: hours,
        checks: 0,
        note: "No checks recorded in this window. The monitor may be new, or logs may have been pruned.",
        currentStatus: monitor.status,
      };
    }

    const up = logs.filter((l) => l.status === "online").length;
    const times = logs
      .map((l) => l.responseTime)
      .filter((t) => typeof t === "number" && t >= 0)
      .sort((a, b) => a - b);

    const percentile = (p) =>
      times.length ? times[Math.min(times.length - 1, Math.floor(times.length * p))] : null;

    const latestSsl = logs.find((l) => l.ssl?.daysUntilExpiry != null)?.ssl;

    return {
      monitor: monitor.name,
      target: monitor.target,
      windowHours: hours,
      currentStatus: monitor.status,
      checks: logs.length,
      uptimePercent: Number(((up / logs.length) * 100).toFixed(2)),
      failedChecks: logs.length - up,
      responseTimeMs: {
        average: times.length
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : null,
        min: times[0] ?? null,
        p95: percentile(0.95),
        max: times[times.length - 1] ?? null,
      },
      lastCheckedAt: logs[0].createdAt,
      ssl: latestSsl
        ? { daysUntilExpiry: latestSsl.daysUntilExpiry, validTo: latestSsl.validTo }
        : null,
    };
  },

  get_recent_incidents: async (input, user) => {
    const hours = clamp(input.hours, 1, 24 * 30, 24);
    const limit = clamp(input.limit, 1, 50, 20);

    let monitors;
    if (input.monitor) {
      const one = await resolveMonitor(input.monitor, user._id);
      if (!one) return { error: `No monitor named "${input.monitor}" on this account.` };
      monitors = [one];
    } else {
      monitors = await Monitoring.find({ owner: user._id }).select("name").lean();
    }

    const namesById = new Map(monitors.map((m) => [String(m._id), m.name]));

    const incidents = await MonitoringLog.find({
      monitoringId: { $in: monitors.map((m) => m._id) },
      status: { $in: DOWN_STATUSES },
      createdAt: { $gte: since(hours) },
    })
      .select("monitoringId status statusCode responseTime error createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      windowHours: hours,
      count: incidents.length,
      incidents: incidents.map((i) => ({
        monitor: namesById.get(String(i.monitoringId)) || "unknown",
        status: i.status,
        httpStatusCode: i.statusCode ?? null,
        error: i.error?.message || i.error?.code || null,
        responseTimeMs: i.responseTime ?? null,
        at: i.createdAt,
      })),
    };
  },

  get_monitor_checks: async (input, user) => {
    const monitor = await resolveMonitor(input.monitor, user._id);
    if (!monitor) return { error: `No monitor named "${input.monitor}" on this account.` };

    const limit = clamp(input.limit, 1, 50, 20);
    const logs = await MonitoringLog.find({ monitoringId: monitor._id })
      .select("status statusCode responseTime timings error createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      monitor: monitor.name,
      target: monitor.target,
      count: logs.length,
      checks: logs.map((l) => ({
        status: l.status,
        httpStatusCode: l.statusCode ?? null,
        responseTimeMs: l.responseTime ?? null,
        timingsMs: l.timings || null,
        error: l.error?.message || null,
        at: l.createdAt,
      })),
    };
  },

  get_account_summary: async (_input, user) => {
    const byStatus = await Monitoring.aggregate([
      { $match: { owner: user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return {
      name: user.name,
      email: user.email,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      memberSince: user.createdAt,
      monitors: {
        total: byStatus.reduce((sum, s) => sum + s.count, 0),
        byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      },
    };
  },
};

// Runs one tool call. Never throws: the model gets the failure as a result so
// it can explain it, rather than the whole chat turn collapsing.
export const runPulseTool = async (name, input, user) => {
  const executor = executors[name];
  if (!executor) return { error: `Unknown tool: ${name}` };

  try {
    return await executor(input || {}, user);
  } catch (error) {
    console.error(`AI tool "${name}" failed:`, error);
    return { error: `Could not read that data: ${error.message}` };
  }
};
