import cron from "node-cron";
import { getAllMonitoringServices, saveMonitoringResult, updateMonitoringStatus } from "../services/monitoringService.js";
import { checkWebsite } from "../utils/monitoringWorker.js";

export const startMonitoring = () => {
  // This cron job runs every minute to check which services need monitoring.
  cron.schedule("* * * * *", async () => {
    console.log("\n-- Running Monitoring Scheduler --");
    const services = await getAllMonitoringServices();
    const now = new Date();

    for (const service of services) {
      const lastChecked = service.updatedAt;
      const intervalMinutes = service.interval || 5; // Default to 5 mins if not set

      const timeSinceLastCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60); // in minutes

      if (timeSinceLastCheck >= intervalMinutes) {
        console.log(`\n🔍 Monitoring required for: ${service.name} (${service.target})`);
        console.log(`   - Last checked: ${timeSinceLastCheck.toFixed(2)} minutes ago`);
        console.log(`   - Interval: ${intervalMinutes} minutes`);

        try {
          const result = await checkWebsite(service);
          const savedLog = await saveMonitoringResult(result);
          await updateMonitoringStatus(service._id, savedLog.status);

          console.log(`   - Result: ${result.status.toUpperCase()} (${result.responseTime}ms)`);
          if (result.error) {
            console.error(`   - Error: ${result.error.message}`);
          }

        } catch (error) {
          console.error(`   - FATAL: An unexpected error occurred during monitoring: ${error.message}`);
          // Optionally update the status to 'offline' or a special 'error' state
          await updateMonitoringStatus(service._id, 'offline');
        }
      } else {
        // Optional: Log services that are not yet due for a check
        // console.log(`- Skipping ${service.name}, next check in ${(intervalMinutes - timeSinceLastCheck).toFixed(2)} minutes.`);
      }
    }
    console.log("\n-- Monitoring Scheduler Finished --");
  });
};