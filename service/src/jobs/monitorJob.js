import cron from "node-cron";
import { getAllMonitoringServices, saveMonitoringResult, updateMonitoringStatus } from "../services/monitoringService.js";
import { monitorWebsite } from "../monitor.js";
import User from "../models/user.model.js";
import MaintenanceWindow from "../models/maintenanceWindow.model.js";

const CURRENT_REGION = process.env.CURRENT_REGION || "us-east-1";

// Map to keep track of running cron jobs for each service
// key: serviceId, value: { job, interval }
const activeJobs = new Map();

export const startMonitoring = async () => {
  // Initial run and then start a master job to sync services every minute
  await syncMonitoringJobs();
  cron.schedule("* * * * *", async () => {
    await syncMonitoringJobs();
  });
};

const syncMonitoringJobs = async () => {
  try {
    const services = await getAllMonitoringServices();

    // Filter services that should be monitored by this region
    const myServices = services.filter(service =>
      service.regions && service.regions.includes(CURRENT_REGION)
    );

    const myServiceIds = new Set(myServices.map(s => s._id.toString()));

    // Stop jobs for services no longer assigned to this region
    for (const [serviceId, jobData] of activeJobs.entries()) {
      if (!myServiceIds.has(serviceId)) {
        jobData.job.stop();
        activeJobs.delete(serviceId);
        console.log(`Stopped monitoring job for service: ${serviceId} in region ${CURRENT_REGION}`);
      }
    }

    // Start or update jobs for assigned services
    for (const service of myServices) {
      const serviceId = service._id.toString();
      const intervalInMinutes = service.interval || 5;

      let cronSchedule;
      if (intervalInMinutes < 1) {
          // e.g. 0.5 min = 30 seconds
          cronSchedule = `*/${Math.round(intervalInMinutes * 60)} * * * * *`;
      } else {
          cronSchedule = `*/${Math.floor(intervalInMinutes)} * * * *`;
      }

      const currentJob = activeJobs.get(serviceId);

      if (!currentJob) {
        const job = cron.schedule(cronSchedule, () => runServiceCheck(service));
        activeJobs.set(serviceId, { job, interval: intervalInMinutes });
        console.log(`Started monitoring job for service: ${service.name} (${serviceId}) every ${intervalInMinutes} min in region ${CURRENT_REGION}`);
      } else if (currentJob.interval !== intervalInMinutes) {
        // Interval changed, restart the job
        currentJob.job.stop();
        const job = cron.schedule(cronSchedule, () => runServiceCheck(service));
        activeJobs.set(serviceId, { job, interval: intervalInMinutes });
        console.log(`Updated monitoring interval for service: ${service.name} (${serviceId}) to ${intervalInMinutes} min`);
      }
    }
  } catch (error) {
    console.error("Error in syncMonitoringJobs:", error);
  }
};

const runServiceCheck = async (service) => {
    try {
        const result = await monitorWebsite(service.target);
        result.region = CURRENT_REGION;
        const savedLog = await saveMonitoringResult(service._id, result);

        // We only want ONE region to update the main status and trigger alerts
        // to avoid duplicate alerts. Usually, the "primary" region or a central service does this.
        // For now, let's say 'us-east-1' is the primary region for status updates and alerts.
        if (CURRENT_REGION === "us-east-1" || (service.regions[0] === CURRENT_REGION)) {
             await updateMonitoringStatus(service._id, savedLog.status, result);
        }
    } catch (error) {
        console.error(`Error monitoring service ${service.name} in ${CURRENT_REGION}:`, error);
        if (CURRENT_REGION === "us-east-1" || (service.regions[0] === CURRENT_REGION)) {
            await updateMonitoringStatus(service._id, 'offline', { error: error.message, region: CURRENT_REGION });
        }
    }
};
