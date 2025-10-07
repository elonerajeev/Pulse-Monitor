import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";

export const getAllMonitoringServices = async () => {
  const services = await Monitoring.find({});
  return services;
};

export const saveMonitoringResult = async (result) => {
  const newLog = new MonitoringLog(result);
  await newLog.save();
  return newLog;
};

export const updateMonitoringStatus = async (monitoringId, newStatus) => {
  await Monitoring.findByIdAndUpdate(monitoringId, { status: newStatus });
};