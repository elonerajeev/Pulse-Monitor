import cron from "node-cron";
import { sweepCertificates } from "../services/sslService.js";
import { registerJob, recordJobRun } from "../state.js";

const JOB_NAME = "ssl-sweep";

// 07:15 UTC. Off the hour so it does not contend with the other daily jobs.
const SCHEDULE = process.env.SSL_SWEEP_CRON || "15 7 * * *";

const run = async () => {
  try {
    const summary = await sweepCertificates();
    console.log(
      `[${JOB_NAME}] examined ${summary.examined}, warned ${summary.warned}, ` +
        `re-armed ${summary.rearmed}, skipped ${summary.skipped}`
    );
    recordJobRun(JOB_NAME);
  } catch (error) {
    recordJobRun(JOB_NAME, error);
    console.error(`[${JOB_NAME}] failed:`, error.message);
  }
};

export const startSslJob = () => {
  registerJob(JOB_NAME);
  cron.schedule(SCHEDULE, run, { timezone: "UTC" });
  console.log(`[${JOB_NAME}] scheduled (${SCHEDULE} UTC)`);
};

export const runSslSweepNow = run;
