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
    return newLog;
};

export const updateMonitoringStatus = async (monitoringId, newStatus) => {
  await Monitoring.findByIdAndUpdate(monitoringId, { status: newStatus });
};

export const deleteOldMonitoringLogs = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await MonitoringLog.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
  return result;
};

export const getMonitoringLogs = async (monitoringId) => {
  const logs = await MonitoringLog.find({ monitoringId }).sort({ createdAt: -1 });
  return logs;
};