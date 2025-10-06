import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Monitoring } from "../models/monitoring.model.js";

const createMonitoring = asyncHandler(async (req, res) => {
  console.log("req.body: ", req.body);
  console.log("req.user: ", req.user);
  const { name, target, serviceType, interval } = req.body;
  
  const monitoring = await Monitoring.create({
    name,
    target,
    serviceType,
    interval: interval || 5,
    owner: req.user._id, // Attach the authenticated user's ID
  });

  if (!monitoring) {
    throw new ApiError(500, "Something went wrong while creating the monitoring service");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, monitoring, "Monitoring service created successfully"));
});

const getMonitoringServices = asyncHandler(async (req, res) => {
  const services = await Monitoring.find({ owner: req.user._id }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, services, "Monitoring services retrieved successfully"));
});

export { createMonitoring, getMonitoringServices };
