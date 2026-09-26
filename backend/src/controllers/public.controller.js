import mongoose from "mongoose";
import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Unauthenticated endpoints backing the shared status page and uptime badges.
//
// Everything here is world-readable, so each query is filtered on
// `isPublic: true`. A monitor the owner has not opted in is treated as
// nonexistent rather than forbidden, so these routes cannot be used to probe
// which monitors an account has.

const UP_STATUSES = ["online"];
const WINDOWS = { day: 1, week: 7, month: 30 };

const since = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// Uptime percentage per window for a set of monitors, in one aggregation pass.
const uptimeByMonitor = async (monitorIds) => {
  if (!monitorIds.length) return new Map();

  const rows = await MonitoringLog.aggregate([
    { $match: { monitoringId: { $in: monitorIds }, createdAt: { $gte: since(WINDOWS.month) } } },
    {
      $group: {
        _id: "$monitoringId",
        monthTotal: { $sum: 1 },
        monthUp: { $sum: { $cond: [{ $in: ["$status", UP_STATUSES] }, 1, 0] } },
        weekTotal: { $sum: { $cond: [{ $gte: ["$createdAt", since(WINDOWS.week)] }, 1, 0] } },
        weekUp: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ["$createdAt", since(WINDOWS.week)] }, { $in: ["$status", UP_STATUSES] }] },
              1, 0,
            ],
          },
        },
        dayTotal: { $sum: { $cond: [{ $gte: ["$createdAt", since(WINDOWS.day)] }, 1, 0] } },
        dayUp: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ["$createdAt", since(WINDOWS.day)] }, { $in: ["$status", UP_STATUSES] }] },
              1, 0,
            ],
          },
        },
        avgResponseTime: { $avg: "$responseTime" },
      },
    },
  ]);

  // A window with no checks reports null, not 100% — absence of data is not uptime.
  const percent = (up, total) => (total > 0 ? Number(((up / total) * 100).toFixed(2)) : null);

  return new Map(
    rows.map((r) => [
      String(r._id),
      {
        day: percent(r.dayUp, r.dayTotal),
        week: percent(r.weekUp, r.weekTotal),
        month: percent(r.monthUp, r.monthTotal),
        checks: { day: r.dayTotal, week: r.weekTotal, month: r.monthTotal },
        avgResponseTime: r.avgResponseTime ? Math.round(r.avgResponseTime) : null,
      },
    ])
  );
};

export const getPublicStatus = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!mongoose.isValidObjectId(slug)) {
    throw new ApiError(404, "Status page not found");
  }

  const owner = await User.findById(slug).select("name").lean();
  const monitors = await Monitoring.find({ owner: slug, isPublic: true })
    .select("name serviceType status updatedAt")
    .sort({ name: 1 })
    .lean();

  if (!owner || !monitors.length) {
    throw new ApiError(404, "Status page not found");
  }

  const uptime = await uptimeByMonitor(monitors.map((m) => m._id));

  const services = monitors.map((m) => ({
    id: String(m._id),
    name: m.name,
    type: m.serviceType,
    status: m.status,
    uptime: uptime.get(String(m._id)) || { day: null, week: null, month: null, checks: null, avgResponseTime: null },
    lastUpdated: m.updatedAt,
  }));

  // The banner reflects the worst monitor: any outage outranks any degradation.
  const overall = services.some((s) => s.status === "offline")
    ? "offline"
    : services.some((s) => s.status === "degraded")
      ? "degraded"
      : services.every((s) => s.status === "pending")
        ? "pending"
        : "online";

  const incidents = await MonitoringLog.find({
    monitoringId: { $in: monitors.map((m) => m._id) },
    status: { $in: ["offline", "down", "error"] },
    createdAt: { $gte: since(WINDOWS.week) },
  })
    .select("monitoringId status statusCode error createdAt")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const nameById = new Map(monitors.map((m) => [String(m._id), m.name]));

  return res.status(200).json(
    new ApiResponse(200, {
      title: `${owner.name}'s Services`,
      overall,
      services,
      // Public view exposes only what failed and when — never response bodies
      // or internal error codes.
      incidents: incidents.map((i) => ({
        service: nameById.get(String(i.monitoringId)) || "Unknown",
        status: i.status,
        httpStatusCode: i.statusCode ?? null,
        at: i.createdAt,
      })),
      generatedAt: new Date(),
    })
  );
});

const BADGE_COLORS = { good: "#3fb950", warn: "#d29922", bad: "#f85149", unknown: "#8b949e" };

const escapeXml = (value) =>
  String(value).replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c])
  );

// Shields-style SVG so a monitor's uptime can be embedded in a README.
export const getUptimeBadge = asyncHandler(async (req, res) => {
  const id = String(req.params.id).replace(/\.svg$/, "");

  let label = "uptime";
  let value = "unknown";
  let color = BADGE_COLORS.unknown;

  if (mongoose.isValidObjectId(id)) {
    const monitor = await Monitoring.findOne({ _id: id, isPublic: true }).select("name").lean();
    if (monitor) {
      const uptime = (await uptimeByMonitor([monitor._id])).get(String(monitor._id));
      const pct = uptime?.day ?? null;
      if (pct !== null) {
        value = `${pct}%`;
        color = pct >= 99 ? BADGE_COLORS.good : pct >= 95 ? BADGE_COLORS.warn : BADGE_COLORS.bad;
      } else {
        value = "no data";
      }
    }
  }

  // Rough advance width for 11px DejaVu Sans, which is close enough for a badge.
  const width = (text) => Math.round(text.length * 6.5) + 20;
  const labelWidth = width(label);
  const valueWidth = width(value);
  const total = labelWidth + valueWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${escapeXml(label)}: ${escapeXml(value)}">
  <title>${escapeXml(label)}: ${escapeXml(value)}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(label)}</text>
    <text x="${labelWidth / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(value)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${escapeXml(value)}</text>
  </g>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  // Short cache: long enough to survive a README refresh, short enough to stay honest.
  res.setHeader("Cache-Control", "public, max-age=300");
  return res.status(200).send(svg);
});
