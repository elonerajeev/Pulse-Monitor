import cron from "node-cron";
import { getAllMonitoringServices, saveMonitoringResult, updateMonitoringStatus } from "../services/monitoringService.js";
import { monitorWebsite } from "../monitor.js";
import { sendEmail } from "../services/alertService.js";
import User from "../models/user.model.js";
import MaintenanceWindow from "../models/maintenanceWindow.model.js"; // Import MaintenanceWindow model

const MONITOR_CRON_SCHEDULE = process.env.MONITOR_CRON_SCHEDULE || "*/5 * * * *";

export const startMonitoring = () => {
  cron.schedule(MONITOR_CRON_SCHEDULE, async () => {
    const services = await getAllMonitoringServices();
    const now = new Date();

    const uniqueUserIds = [...new Set(services.map(service => service.owner.toString()))];
    const users = await User.find({ _id: { $in: uniqueUserIds } });
    const usersMap = new Map(users.map(user => [user._id.toString(), user]));

    await Promise.all(services.map(async (service) => {
      try {
        const result = await monitorWebsite(service.target);
        const savedLog = await saveMonitoringResult(service._id, result);
        await updateMonitoringStatus(service._id, savedLog.status);

        // Check for active maintenance window BEFORE sending alert
        if (result.status !== 'online' && result.status !== 200) {
          const activeMaintenanceWindow = await MaintenanceWindow.findOne({
            serviceId: service._id,
            isActive: true,
            startTime: { $lte: now }, // Maintenance started before or at now
            endTime: { $gte: now },   // Maintenance ends after or at now
          });

          if (activeMaintenanceWindow) {
            console.log(`Alert for service "${service.name}" (${service._id}) suppressed due to active maintenance window.`);
            return; // Skip alert sending for this service
          }
        }

        // Existing alert logic
        if (service.alert && result.status !== 'online' && result.status !== 200) {
          const user = usersMap.get(service.owner.toString()); // Get user from map
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
        // Even if there's an error in monitoring, still update status to offline
        await updateMonitoringStatus(service._id, 'offline');

        // Check for maintenance window before alerting on general error
        const activeMaintenanceWindow = await MaintenanceWindow.findOne({
          serviceId: service._id,
          isActive: true,
          startTime: { $lte: now },
          endTime: { $gte: now },
        });

        if (activeMaintenanceWindow) {
          console.log(`Alert for service "${service.name}" (${service._id}) due to monitoring error suppressed by active maintenance window.`);
          return; // Skip alert if maintenance is active
        }

        // If no maintenance, and an alert condition for errors exists, send alert
        // (This part depends on how you want to handle alerts for general monitoring errors vs specific status codes)
        // For now, if an error occurs outside of a maintenance window, it would proceed
        // to general error handling in `sendEmail` if configured.
      }
    }));
  });
};