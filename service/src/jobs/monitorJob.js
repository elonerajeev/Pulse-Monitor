import cron from "node-cron";
import { getAllMonitoringServices, saveMonitoringResult, updateMonitoringStatus } from "../services/monitoringService.js";
import { monitorWebsite } from "../monitor.js";

export const startMonitoring = () => {
  // This cron job runs every 5 minutes to check which services need monitoring.
  cron.schedule("*/5 * * * *", async () => {
    console.log("\n-- Running Monitoring Scheduler --");
    const services = await getAllMonitoringServices();
    const now = new Date();

    for (const service of services) {
        console.log(`\n🔍 Monitoring required for: ${service.name} (${service.target})`);

        try {
          const result = await monitorWebsite(service.target);
          const savedLog = await saveMonitoringResult(service._id, result);
          await updateMonitoringStatus(service._id, savedLog.status);

          console.log(`   - Result: ${result.status.toUpperCase()} (${result.responseTime}ms)`);
          if (result.error) {
            console.error(`   - Error: ${result.error}`);
          }

        } catch (error) {
          console.error(`   - FATAL: An unexpected error occurred during monitoring: ${error.message}`);
          // Optionally update the status to 'offline' or a special 'error' state
          await updateMonitoringStatus(service._id, 'offline');
        }
    }
    console.log("\n-- Monitoring Scheduler Finished --");
  });
};