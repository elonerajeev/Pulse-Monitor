
import cron from "node-cron";
import { getAllMonitoringServices, saveMonitoringResult, updateMonitoringStatus } from "../services/monitoringService.js";
import { monitorWebsite } from "../monitor.js";
import { sendEmail } from "../services/alertService.js";
import User from "../models/user.model.js";

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
        await updateMonitoringStatus(service._id, 'offline');
      }
    }));
  });
};
