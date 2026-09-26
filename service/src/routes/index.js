import { Router } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { getMonitoringLogs } from "../services/monitoringService.js";
import { getWorkerState } from "../state.js";

const router = Router();

/** Constant-time secret comparison, so the token cannot be recovered by timing. */
const timingSafeMatch = (presented, expected) => {
  if (typeof presented !== "string") return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, so compare hashes of equal size.
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

/**
 * Liveness/readiness probe.
 *
 * Reports 503 when the database is not connected or when a job that should be
 * running on a schedule has not completed a run recently, so a wedged worker
 * fails its probe instead of sitting there looking healthy.
 */
router.get("/health", (req, res) => {
  const state = getWorkerState();
  const dbConnected = mongoose.connection.readyState === 1;

  // A job that has never succeeded is not yet stale — it may not have reached
  // its first tick. Only a job that ran and then went quiet counts as stale.
  const STALE_AFTER_MS = 15 * 60 * 1000;
  const now = Date.now();
  const stale = Object.entries(state.jobs)
    .filter(([, job]) => job.lastSuccessAt && now - job.lastSuccessAt.getTime() > STALE_AFTER_MS)
    .map(([name]) => name);

  const healthy = dbConnected && stale.length === 0;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    region: state.region,
    uptimeSeconds: state.uptimeSeconds,
    database: dbConnected ? "connected" : "disconnected",
    staleJobs: stale,
    jobs: state.jobs,
  });
});

/**
 * Internal log access.
 *
 * This used to be an unauthenticated route that returned any monitor's logs to
 * anyone who could guess an id — logs belong to a tenant, so it is now gated on
 * a shared secret. With INTERNAL_API_TOKEN unset the route stays closed rather
 * than falling open, since an unset secret is the common misconfiguration.
 */
router.get("/internal/monitoring-logs/:monitoringId", async (req, res) => {
  const expected = process.env.INTERNAL_API_TOKEN;

  if (!expected) {
    return res.status(404).json({ message: "Not found" });
  }

  if (!timingSafeMatch(req.header("x-internal-token"), expected)) {
    return res.status(404).json({ message: "Not found" });
  }

  if (!mongoose.isValidObjectId(req.params.monitoringId)) {
    return res.status(400).json({ message: "Invalid monitoring id" });
  }

  try {
    const logs = await getMonitoringLogs(req.params.monitoringId, 200);
    res.json(logs);
  } catch (error) {
    console.error("Internal log fetch failed:", error.message);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

export default router;
