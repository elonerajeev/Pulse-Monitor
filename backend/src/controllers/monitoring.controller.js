import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../services/emailService.js";

const createMonitoring = asyncHandler(async (req, res) => {
  const { name, target, serviceType, interval } = req.body;

  // Basic validation
  if (!name || !target || !serviceType) {
    throw new ApiError(400, "Name, target, and service type are required");
  }

  const monitoring = await Monitoring.create({
    name,
    target,
    serviceType,
    interval: interval || 5,
    owner: req.user._id,
  });

  if (!monitoring) {
    throw new ApiError(500, "Something went wrong while creating the monitoring service");
  }

  // Create an initial pending log so it shows up on the dashboard immediately
  await MonitoringLog.create({
    monitoringId: monitoring._id,
    status: 'pending',
  });

  // Send email notification
  const emailData = {
    userName: req.user.name,
    serviceName: monitoring.name,
    serviceTarget: monitoring.target,
    interval: monitoring.interval,
  };
  const subject = `New Monitoring Service Added: ${monitoring.name}`;
  await sendEmail(req.user.email, subject, 'serviceAdded', emailData);

  return res
    .status(201)
    .json(new ApiResponse(201, monitoring, "Monitoring service created successfully"));
});

const getMonitoringServices = asyncHandler(async (req, res) => {
  const services = await Monitoring.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "monitoringlogs",
        localField: "_id",
        foreignField: "monitoringId",
        as: "logs",
        pipeline: [
          { $sort: { createdAt: -1 } },
          { $limit: 20 }, // Fetch more logs for the chart
        ],
      },
    },
    {
      $addFields: {
        latestLog: { $first: "$logs" },
        // To avoid having to process this on the frontend, we can reverse the array here
        logs: { $reverseArray: "$logs" }
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, services, "Monitoring services retrieved successfully"));
});

const updateMonitoring = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, target, serviceType, interval } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid monitoring ID");
  }

  const monitoring = await Monitoring.findById(id);

  if (!monitoring) {
    throw new ApiError(404, "Monitoring service not found");
  }

  if (monitoring.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this service");
  }

  const updatedMonitoring = await Monitoring.findByIdAndUpdate(
    id,
    {
      $set: {
        name,
        target,
        serviceType,
        interval,
      },
    },
    { new: true }
  );

  if (!updatedMonitoring) {
    throw new ApiError(500, "Something went wrong while updating the monitoring service");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMonitoring, "Monitoring service updated successfully"));
});

const deleteMonitoring = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid monitoring ID");
  }

  const monitoring = await Monitoring.findById(id);

  if (!monitoring) {
    throw new ApiError(404, "Monitoring service not found");
  }

  if (monitoring.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this service");
  }

  await Monitoring.findByIdAndDelete(id);
  // Also delete associated logs
  await MonitoringLog.deleteMany({ monitoringId: id });


  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Monitoring service deleted successfully"));
});

export { createMonitoring, getMonitoringServices, updateMonitoring, deleteMonitoring };
