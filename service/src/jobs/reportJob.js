import cron from "node-cron";
import { runWeeklyReports } from "../services/reportService.js";
import { registerJob, recordJobRun } from "../state.js";

const JOB_NAME = "weekly-report";

// Monday 08:00 UTC. runWeeklyReports claims each user atomically before doing
// the work, so a restart mid-run resumes rather than double-sending.
const SCHEDULE = process.env.WEEKLY_REPORT_CRON || "0 8 * * 1";

const run = async () => {
  try {
    const summary = await runWeeklyReports();
    console.log(
      `[${JOB_NAME}] candidates ${summary.candidates}, sent ${summary.sent}, ` +
        `skipped ${summary.skipped}, failed ${summary.failed}`
    );
    recordJobRun(JOB_NAME);
  } catch (error) {
    recordJobRun(JOB_NAME, error);
    console.error(`[${JOB_NAME}] failed:`, error.message);
  }
};

export const startReportJob = () => {
  registerJob(JOB_NAME);
  cron.schedule(SCHEDULE, run, { timezone: "UTC" });
  console.log(`[${JOB_NAME}] scheduled (${SCHEDULE} UTC)`);
};

export const runWeeklyReportsNow = run;
