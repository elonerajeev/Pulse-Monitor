import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";

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
  await Monitoring.findByIdAndUpdate(monitoringId, { status: newStatus });
};

export const getMonitoringLogs = async (monitoringId) => {
  const logs = await MonitoringLog.find({ monitoringId }).sort({ createdAt: -1 });
  return logs;
};