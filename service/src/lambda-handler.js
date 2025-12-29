
import 'dotenv/config.js';
import db from "./config/db.js";
import { getAllMonitoringServices, saveMonitoringResult, updateMonitoringStatus } from "./services/monitoringService.js";
import { monitorWebsite } from "./monitor.js";
import { sendEmail } from "./services/alertService.js";
import User from "./models/user.model.js";
import MaintenanceWindow from "./models/maintenanceWindow.model.js";

export const handler = async (event) => {
  try {
    // Connect to the database
    await db();

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
            console.log(`Alert for service \"${service.name}\" (${service._id}) suppressed due to active maintenance window.`);
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
          console.log(`Alert for service \"${service.name}\" (${service._id}) due to monitoring error suppressed by active maintenance window.`);
          return; // Skip alert if maintenance is active
        }
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify('Monitoring job completed successfully!'),
    };
  } catch (error) {
    console.error('Error in monitoring job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Monitoring job failed.'),
    };
  }
};
