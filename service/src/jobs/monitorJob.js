import cron from "node-cron";
import { Monitoring } from "../models/monitoring.model.js";
import {
  getActiveMonitoringServices,
  saveMonitoringResult,
  updateMonitoringStatus,
} from "../services/monitoringService.js";
import { evaluateCheck } from "../services/checkEvaluator.js";
import { monitorWebsite } from "../monitor.js";
import { registerJob, recordJobRun } from "../state.js";

const CURRENT_REGION = process.env.CURRENT_REGION || "us-east-1";

// Map of scheduled checks. key: serviceId, value: { job, interval }
const activeJobs = new Map();

export const startMonitoring = async () => {
  registerJob("monitor-sync");

  await syncMonitoringJobs();
  cron.schedule("* * * * *", async () => {
    await syncMonitoringJobs();
  });
};

/** Turns a check interval in minutes into a cron expression. */
const cronScheduleFor = (intervalInMinutes) => {
  if (intervalInMinutes < 1) {
    return `*/${Math.round(intervalInMinutes * 60)} * * * * *`;
  }
  return `*/${Math.floor(intervalInMinutes)} * * * *`;
};

const stopJob = (serviceId, reason) => {
  const existing = activeJobs.get(serviceId);
  if (!existing) return;
  existing.job.stop();
  activeJobs.delete(serviceId);
  console.log(`Stopped monitoring job for service ${serviceId} (${reason})`);
};

const syncMonitoringJobs = async () => {
  try {
    const services = await getActiveMonitoringServices();

    const myServices = services.filter(
      (service) => service.regions && service.regions.includes(CURRENT_REGION)
    );

    const myServiceIds = new Set(myServices.map((s) => s._id.toString()));

    // Drop jobs for monitors that were deleted, paused, or reassigned to
    // another region.
    for (const serviceId of activeJobs.keys()) {
      if (!myServiceIds.has(serviceId)) {
        stopJob(serviceId, "no longer assigned to this region");
      }
    }

    for (const service of myServices) {
      const serviceId = service._id.toString();
      const intervalInMinutes = service.interval || 5;
      const currentJob = activeJobs.get(serviceId);

      if (currentJob && currentJob.interval === intervalInMinutes) continue;

      if (currentJob) currentJob.job.stop();

      // Scheduled by id, not by the document: runServiceCheck reloads the
      // monitor each run, so an edit to its assertions or alerting policy takes
      // effect on the next check instead of on the next restart.
      const job = cron.schedule(cronScheduleFor(intervalInMinutes), () =>
        runServiceCheck(serviceId)
      );
      activeJobs.set(serviceId, { job, interval: intervalInMinutes });

      console.log(
        `${currentJob ? "Updated" : "Started"} monitoring for ${service.name} ` +
          `(${serviceId}) every ${intervalInMinutes} min in ${CURRENT_REGION}`
      );
    }

    recordJobRun("monitor-sync");
  } catch (error) {
    recordJobRun("monitor-sync", error);
    console.error("Error in syncMonitoringJobs:", error);
  }
};

/**
 * Only one region announces status changes and alerts, so a monitor checked
 * from several regions does not page its owner once per region.
 */
const isAnnouncingRegion = (service) =>
  CURRENT_REGION === "us-east-1" || service.regions?.[0] === CURRENT_REGION;

const runServiceCheck = async (serviceId) => {
  let service;

  try {
    service = await Monitoring.findById(serviceId).lean();

    if (!service) {
      stopJob(String(serviceId), "monitor no longer exists");
      return;
    }

    if (service.isPaused) {
      stopJob(String(serviceId), "monitor is paused");
      return;
    }

    const raw = await monitorWebsite(service.target);
    // Reachability is not health: this applies the monitor's status-code and
    // body assertions to decide whether the response actually passes.
    const result = evaluateCheck(raw, service);
    result.region = CURRENT_REGION;

    const savedLog = await saveMonitoringResult(service._id, result);

    if (isAnnouncingRegion(service)) {
      const outcome = await updateMonitoringStatus(service._id, savedLog.status, result);
      if (outcome.transitioned) {
        console.log(
          `${service.name}: ${outcome.previousStatus ?? "?"} → ${outcome.status}` +
            (outcome.alerted ? " (alerted)" : ` (alert suppressed: ${outcome.reason})`)
        );
      }
    }
  } catch (error) {
    console.error(`Error monitoring service ${service?.name ?? serviceId}:`, error.message);

    // The probe itself failed rather than the target. Record it as a failed
    // check so the confirmation counter still advances.
    if (service && isAnnouncingRegion(service)) {
      await updateMonitoringStatus(service._id, "offline", {
        error: { message: error.message, code: "PROBE_ERROR" },
        region: CURRENT_REGION,
      });
    }
  }
};
