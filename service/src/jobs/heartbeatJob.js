import cron from "node-cron";
import { sweepHeartbeats } from "../services/heartbeatService.js";
import { registerJob, recordJobRun } from "../state.js";

const JOB_NAME = "heartbeat-sweep";

// Every minute: a heartbeat's grace period is measured in minutes, so a coarser
// sweep would add its own interval to every overdue alert.
const SCHEDULE = "* * * * *";

let running = false;

const run = async () => {
  // A slow sweep must not stack: overlapping runs would race each other for the
  // same alert claims.
  if (running) return;
  running = true;

  try {
    const summary = await sweepHeartbeats();
    if (summary.alerted > 0) {
      console.log(
        `[${JOB_NAME}] examined ${summary.examined}, marked down ${summary.alerted}`
      );
    }
    recordJobRun(JOB_NAME);
  } catch (error) {
    recordJobRun(JOB_NAME, error);
    console.error(`[${JOB_NAME}] failed:`, error.message);
  } finally {
    running = false;
  }
};

export const startHeartbeatJob = () => {
  registerJob(JOB_NAME);
  cron.schedule(SCHEDULE, run);
  console.log(`[${JOB_NAME}] scheduled (every minute)`);
};

export const runHeartbeatSweepNow = run;
