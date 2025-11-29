import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../services/emailService.js";

const createMonitoring = asyncHandler(async (req, res) => {
  const { name, target, serviceType, interval, location, dependencies } = req.body;

  // Basic validation
  if (!name || !target || !serviceType) {
    throw new ApiError(400, "Name, target, and service type are required");
  }

  const monitoring = await Monitoring.create({
    name,
    target,
    serviceType,
    interval: interval || 5,
    location,
    owner: req.user._id,
    dependencies, // Include dependencies here
  });

  if (!monitoring) {
    throw new ApiError(500, "Something went wrong while creating the monitoring service");
  }

  // Create an initial pending log so it shows up on the dashboard immediately
  await MonitoringLog.create({
    monitoringId: monitoring._id,
    status: 'pending',
    requests: Math.floor(Math.random() * 1000), // Add random requests
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
          { $limit: 200 }, // Fetch only the 200 most recent logs
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
    // Populate dependencies
    {
      $lookup: {
        from: "monitorings", // The collection name for the Monitoring model is typically "monitorings" (pluralized lowercase)
        localField: "dependencies",
        foreignField: "_id",
        as: "dependencies",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, services, "Monitoring services retrieved successfully"));
});

const getRecentMonitoringLogs = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 20;
    const logs = await MonitoringLog.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('monitoringId', 'name')
        .lean();

    const formattedLogs = logs.map(log => ({
        ...log,
        monitor: log.monitoringId,
        message: `Service is ${log.status}`
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, formattedLogs, "Recent logs fetched successfully"));
});

const updateMonitoring = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, target, serviceType, interval, location, dependencies } = req.body;

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
        location,
        dependencies, // Include dependencies here
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

const pruneMonitoringLogs = asyncHandler(async (req, res) => {
  const services = await Monitoring.find({ owner: req.user._id });
  let deletedCount = 0;

  for (const service of services) {
    const logs = await MonitoringLog.find({ monitoringId: service._id }).sort({ createdAt: -1 });

    if (logs.length <= 10) continue; // Skip if 10 or fewer logs

    const logsToKeep = new Set();
    let lastStatus = null;

    // Keep logs where status changes
    for (let i = 0; i < logs.length; i++) {
      if (i === 0) {
        logsToKeep.add(logs[i]._id.toString());
        lastStatus = logs[i].status;
      } else if (logs[i].status !== lastStatus) {
        logsToKeep.add(logs[i]._id.toString());
        logsToKeep.add(logs[i-1]._id.toString()); // Keep the log before the change
        lastStatus = logs[i].status;
      }
    }

    // Keep the 10 most recent logs regardless of status change
    for (let i = 0; i < Math.min(logs.length, 10); i++) {
        logsToKeep.add(logs[i]._id.toString());
    }

    const logsToDelete = logs.filter(log => !logsToKeep.has(log._id.toString()));

    if (logsToDelete.length > 0) {
      const deleteResult = await MonitoringLog.deleteMany({
        _id: { $in: logsToDelete.map(l => l._id) }
      });
      deletedCount += deleteResult.deletedCount;
    }
  }

  return res.status(200).json(new ApiResponse(200, { deletedCount }, "Log pruning completed successfully"));
});

const getRCADetails = asyncHandler(async (req, res) => {
    const { logId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(logId)) {
        throw new ApiError(400, "Invalid log ID");
    }

    const incidentLog = await MonitoringLog.findById(logId).populate({
        path: 'monitoringId',
        populate: {
            path: 'dependencies',
            model: 'Monitoring' // Specify the model for the 'dependencies' path
        }
    });

    if (!incidentLog) {
        throw new ApiError(404, "Incident log not found");
    }

    // Authorization check
    // The service is now populated within incidentLog.monitoringId
    if (incidentLog.monitoringId.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this log");
    }

    const logsBefore = await MonitoringLog.find({
        monitoringId: incidentLog.monitoringId._id, // Use _id from the populated object
        createdAt: { $lt: incidentLog.createdAt }
    }).sort({ createdAt: -1 }).limit(5);

    const logsAfter = await MonitoringLog.find({
        monitoringId: incidentLog.monitoringId._id, // Use _id from the populated object
        createdAt: { $gt: incidentLog.createdAt }
    }).sort({ createdAt: 1 }).limit(5);

    const rcaDetails = {
        incident: incidentLog,
        service: incidentLog.monitoringId, 
        logsBefore: logsBefore.reverse(), // To show in chronological order
        logsAfter
    };

    return res.status(200).json(new ApiResponse(200, rcaDetails, "RCA details fetched successfully"));
});

const getLogsForService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid monitoring ID");
  }

  const monitoring = await Monitoring.findById(id);

  if (!monitoring) {
    throw new ApiError(404, "Monitoring service not found");
  }

  if (monitoring.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view these logs");
  }

  const logs = await MonitoringLog.find({ monitoringId: id }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, logs, "Logs retrieved successfully"));
});

const getMonitoringService = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid monitoring ID");
    }

    const service = await Monitoring.aggregate([
        {
            $match: { 
                _id: new mongoose.Types.ObjectId(id),
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "monitoringlogs",
                localField: "_id",
                foreignField: "monitoringId",
                as: "logs",
                pipeline: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 10 } // Fetch only the 10 most recent logs
                ]
            }
        },
        {
            $addFields: {
                latestLog: { $first: "$logs" },
                logs: { $reverseArray: "$logs" }
            }
        },
        {
            $lookup: {
                from: "monitorings",
                localField: "dependencies",
                foreignField: "_id",
                as: "dependencies"
            }
        },
        {
            $limit: 1 // Since we are fetching by ID, we expect only one result
        }
    ]);

    if (!service || service.length === 0) {
        throw new ApiError(404, "Monitoring service not found or you do not have permission to view it.");
    }

    return res.status(200).json(new ApiResponse(200, service[0], "Monitoring service retrieved successfully"));
});


export { createMonitoring, getMonitoringServices, updateMonitoring, deleteMonitoring, getRecentMonitoringLogs, pruneMonitoringLogs, getRCADetails, getLogsForService, getMonitoringService };