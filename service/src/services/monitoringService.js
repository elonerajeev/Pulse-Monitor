import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "./emailService.js";

export const getAllMonitoringServices = async () => {
  const services = await Monitoring.find({});
  return services;
};

export const saveMonitoringResult = async (monitoringId, result) => {
    const newLog = new MonitoringLog({
        monitoringId,
        ...result
    });
    await newLog.save();

    const logs = await MonitoringLog.find({ monitoringId }).sort({ createdAt: -1 }).select('_id').lean();
    if (logs.length > 15) {
        const idsToDelete = logs.slice(15).map(log => log._id);
        await MonitoringLog.deleteMany({ _id: { $in: idsToDelete } });
    }

    return newLog;
};

export const updateMonitoringStatus = async (monitoringId, newStatus) => {
  const monitoring = await Monitoring.findById(monitoringId).populate('owner');

  if (monitoring && monitoring.status !== newStatus) {
    const user = monitoring.owner;

    if (user) {
      // Create in-app notification
      const notification = new Notification({
        userId: user._id,
        monitoringId: monitoring._id,
        message: `Your monitoring service '${monitoring.name}' is now ${newStatus}.`,
      });
      await notification.save();

      // Send email notification
      const emailData = {
        userName: user.name,
        serviceName: monitoring.name,
        serviceTarget: monitoring.target,
        status: newStatus,
        timestamp: new Date().toUTCString(),
        responseTime: '-', // This could be improved to include actual response time
        error: 'N/A', // This could be improved to include actual error
      };
      const subject = `PulseMonitor: ${monitoring.name} is now ${newStatus}`;
      await sendEmail(user.email, subject, 'alert', emailData);
    }
    await Monitoring.findByIdAndUpdate(monitoringId, { status: newStatus });

  } else if (monitoring) {
    // Even if status has not changed, ensure it is correctly set in the Monitoring model
    await Monitoring.findByIdAndUpdate(monitoringId, { status: newStatus });
  }
};

export const getMonitoringLogs = async (monitoringId) => {
  const logs = await MonitoringLog.find({ monitoringId }).sort({ createdAt: -1 });
  return logs;
};