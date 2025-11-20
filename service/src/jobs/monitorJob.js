
import cron from "node-cron";
import { getAllMonitoringServices, saveMonitoringResult, updateMonitoringStatus } from "../services/monitoringService.js";
import { monitorWebsite } from "../monitor.js";
import { sendEmail } from "../services/alertService.js";
import User from "../models/user.model.js";

export const startMonitoring = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("\n-- Running Monitoring Scheduler --");
    const services = await getAllMonitoringServices();
    const now = new Date();

    await Promise.all(services.map(async (service) => {
      console.log(`\n🔍 Monitoring required for: ${service.name} (${service.target})`);

      try {
        const result = await monitorWebsite(service.target);
        const savedLog = await saveMonitoringResult(service._id, result);
        await updateMonitoringStatus(service._id, savedLog.status);

        console.log(`   - Result: ${result.status.toUpperCase()} (${result.responseTime}ms)`);
        if (result.error) {
          console.error(`   - Error: ${result.error}`);
        }
        if (service.alert && result.status !== 'online' && result.status !== 200) {
          const user = await User.findById(service.owner);
          if (user && service.alertEmail) {
            const alertData = {
              userName: user.name,
              serviceName: service.name,
              serviceTarget: service.target,
              status: result.status,
              timestamp: now.toUTCString(),
              responseTime: result.responseTime,
              error: result.error || 'N/A',
            };
            await sendEmail(service.alertEmail, alertData);
          }
        }
      } catch (error) {
        console.error(`   - FATAL: An unexpected error occurred during monitoring: ${error.message}`);
        await updateMonitoringStatus(service._id, 'offline');
      }
    }));
    console.log("\n-- Monitoring Scheduler Finished --");
  });
};
