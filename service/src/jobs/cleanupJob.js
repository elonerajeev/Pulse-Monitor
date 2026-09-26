import cron from "node-cron";
import { deleteOldMonitoringLogs } from "../services/monitoringService.js";
import { deleteOrphanedHeartbeatPings } from "../services/heartbeatService.js";
import { registerJob, recordJobRun } from "../state.js";

const JOB_NAME = "cleanup";

// 03:30 UTC daily. Age-based expiry is handled by the collections' TTL indexes;
// this only sweeps logs whose monitor no longer exists, which TTL cannot see.
const SCHEDULE = process.env.CLEANUP_CRON || "30 3 * * *";

const run = async () => {
  try {
    const logs = await deleteOldMonitoringLogs();
    const pings = await deleteOrphanedHeartbeatPings();
    console.log(
      `[${JOB_NAME}] removed ${logs.deletedCount} orphaned log(s) and ` +
        `${pings.deletedCount} orphaned ping(s)`
    );
    recordJobRun(JOB_NAME);
  } catch (error) {
    recordJobRun(JOB_NAME, error);
    console.error(`[${JOB_NAME}] failed:`, error.message);
  }
};

export const startCleanupJob = () => {
  registerJob(JOB_NAME);
  cron.schedule(SCHEDULE, run, { timezone: "UTC" });
  console.log(`[${JOB_NAME}] scheduled (${SCHEDULE} UTC)`);
};

export const runCleanupNow = run;
