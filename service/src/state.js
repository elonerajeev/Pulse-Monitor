/**
 * In-memory snapshot of what this worker process is doing.
 *
 * The health endpoint reads it so an orchestrator can tell the difference
 * between "the process is up" and "the process is actually running checks".
 * A worker whose cron jobs have silently died still answers TCP connections,
 * which is exactly the failure a naive liveness probe misses.
 */
const startedAt = new Date();

const state = {
  startedAt,
  region: process.env.CURRENT_REGION || "us-east-1",
  jobs: {},
};

/** Records that a named job began running on its schedule. */
export const registerJob = (name) => {
  state.jobs[name] = {
    startedAt: new Date(),
    lastRunAt: null,
    lastSuccessAt: null,
    lastError: null,
    runs: 0,
    failures: 0,
  };
};

/** Records the outcome of one run of a named job. */
export const recordJobRun = (name, error = null) => {
  const job = state.jobs[name];
  if (!job) return;
  job.lastRunAt = new Date();
  job.runs += 1;
  if (error) {
    job.failures += 1;
    job.lastError = error.message || String(error);
  } else {
    job.lastSuccessAt = job.lastRunAt;
    job.lastError = null;
  }
};

export const getWorkerState = () => ({
  ...state,
  uptimeSeconds: Math.round((Date.now() - startedAt.getTime()) / 1000),
});
