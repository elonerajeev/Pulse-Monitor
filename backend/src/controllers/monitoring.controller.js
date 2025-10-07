import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Monitoring } from "../models/monitoring.model.js";
import mongoose from "mongoose";

const createMonitoring = asyncHandler(async (req, res) => {
  const { name, target, serviceType, interval } = req.body;

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
          { $limit: 1 },
        ],
      },
    },
    {
      $addFields: {
        latestLog: { $first: "$logs" },
      },
    },
    {
      $project: {
        logs: 0, // Exclude the full logs array
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, services, "Monitoring services retrieved successfully"));
});

export { createMonitoring, getMonitoringServices };

