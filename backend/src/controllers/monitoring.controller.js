import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Monitoring } from "../models/monitoring.model.js";
import { MonitoringLog } from "../models/monitoring_log.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../services/emailService.js";
import { sendTestAlert } from "../services/alertService.js";


/**
 * Whitelists the assertion fields a client may set.
 *
 * The request body reaches a $set, so anything not named here must not survive
 * — an unfiltered nested object lets a caller write fields the schema never
 * declared, or clear ones it never mentioned.
 */
const sanitizeAssertions = (input) => {
  if (input == null) return undefined;
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError(400, "assertions must be an object");
  }

  const out = {};

  if ("expectedStatusCode" in input) {
    const code = input.expectedStatusCode;
    if (code === null || code === "") {
      out.expectedStatusCode = null;
    } else {
      const parsed = Number(code);
      if (!Number.isInteger(parsed) || parsed < 100 || parsed > 599) {
        throw new ApiError(400, "expectedStatusCode must be an HTTP status between 100 and 599");
      }
      out.expectedStatusCode = parsed;
    }
  }

  for (const key of ["mustContain", "mustNotContain"]) {
    if (key in input) {
      const value = input[key];
      if (value === null || value === "") {
        out[key] = "";
        continue;
      }
      if (typeof value !== "string") throw new ApiError(400, `${key} must be a string`);
      if (value.length > 500) throw new ApiError(400, `${key} must be 500 characters or fewer`);
      out[key] = value.trim();
    }
  }

  if ("caseSensitive" in input) out.caseSensitive = Boolean(input.caseSensitive);

  return out;
};

/** Same whitelist treatment for the alerting policy. */
const sanitizeAlerting = (input) => {
  if (input == null) return undefined;
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError(400, "alerting must be an object");
  }

  const out = {};
  const bounded = (key, min, max) => {
    const parsed = Number(input[key]);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      throw new ApiError(400, `${key} must be a whole number between ${min} and ${max}`);
    }
    out[key] = parsed;
  };

  if ("enabled" in input) out.enabled = Boolean(input.enabled);
  if ("confirmations" in input) bounded("confirmations", 1, 10);
  if ("recoveryConfirmations" in input) bounded("recoveryConfirmations", 1, 10);
  if ("cooldownMinutes" in input) bounded("cooldownMinutes", 0, 1440);

  if ("sslExpiryDays" in input) {
    const days = input.sslExpiryDays;
    if (!Array.isArray(days)) throw new ApiError(400, "sslExpiryDays must be an array of days");
    const parsed = days.map(Number);
    if (parsed.some((d) => !Number.isInteger(d) || d < 1 || d > 365)) {
      throw new ApiError(400, "sslExpiryDays entries must be between 1 and 365");
    }
    // Descending, de-duplicated: the sweep picks the tightest band that has been
    // crossed, and duplicates would just re-check the same threshold.
    out.sslExpiryDays = [...new Set(parsed)].sort((a, b) => b - a);
  }

  return out;
};

/**
 * Flattens a nested patch into dotted $set paths.
 *
 * Setting `{ assertions: {...} }` wholesale replaces the sub-document, which
 * would silently clear any field the caller did not resend.
 */
const dotted = (prefix, value) => {
  if (!value) return {};
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [`${prefix}.${k}`, v]));
};

/** Loads a monitor and proves the caller owns it. */
const findOwnedMonitor = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid monitoring ID");
  }

  const monitoring = await Monitoring.findById(id);
  if (!monitoring) throw new ApiError(404, "Monitoring service not found");

  if (monitoring.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to access this service");
  }

  return monitoring;
};

const createMonitoring = asyncHandler(async (req, res) => {
  const { name, target, serviceType, interval, location, dependencies, isPublic, assertions, alerting } =
    req.body;

  // Basic validation
  if (!name || !target || !serviceType) {
    throw new ApiError(400, "Name, target, and service type are required");
  }

  const cleanAssertions = sanitizeAssertions(assertions);
  const cleanAlerting = sanitizeAlerting(alerting);

  const monitoring = await Monitoring.create({
    name,
    target,
    serviceType,
    interval: interval || 5,
    location,
    owner: req.user._id,
    dependencies, // Include dependencies here
    ...(typeof isPublic === "boolean" && { isPublic }),
    ...(cleanAssertions && { assertions: cleanAssertions }),
    ...(cleanAlerting && { alerting: cleanAlerting }),
  });

  if (!monitoring) {
    throw new ApiError(500, "Something went wrong while creating the monitoring service");
  }

  // Create an initial pending log so it shows up on the dashboard immediately
  await MonitoringLog.create({
    monitoringId: monitoring._id,
    status: 'pending',
    // Zero, not a random number: this log represents a monitor that has not been
    // checked yet, and inventing traffic here made the dashboard show numbers
    // that were never measured.
    requests: 0,
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
    // Clamp the limit: an unbounded `limit` query lets a single request pull the
    // whole log collection into memory.
    const requested = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requested)
        ? Math.min(Math.max(requested, 1), 100)
        : 20;

    // Logs carry no owner of their own, so scope the query to the monitors this
    // user owns. Querying MonitoringLog directly would return every tenant's
    // logs to whoever asked.
    const ownedIds = await Monitoring.find({ owner: req.user._id })
        .select("_id")
        .lean();

    if (ownedIds.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "Recent logs fetched successfully"));
    }

    const logs = await MonitoringLog.find({
        monitoringId: { $in: ownedIds.map((m) => m._id) },
    })
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
  const {
    name,
    target,
    serviceType,
    interval,
    location,
    dependencies,
    isPublic,
    isPaused,
    assertions,
    alerting,
  } = req.body;

  await findOwnedMonitor(id, req.user._id);

  const cleanAssertions = sanitizeAssertions(assertions);
  const cleanAlerting = sanitizeAlerting(alerting);

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
        // Only overwrite the public flag when the caller actually sent it, so a
        // partial update cannot silently unpublish a monitor.
        ...(typeof isPublic === "boolean" && { isPublic }),
        ...(typeof isPaused === "boolean" && { isPaused }),
        // Dotted paths, so sending one assertion does not wipe the others.
        ...dotted("assertions", cleanAssertions),
        ...dotted("alerting", cleanAlerting),
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

/**
 * Deletes this account's monitoring logs older than a cutoff.
 *
 * Rewritten from a count-based prune that kept roughly the ten most recent logs
 * per monitor plus its status transitions. That threw away the samples uptime
 * percentages and average response times are computed from, so a single prune
 * silently invalidated every report and chart. It also read every log for every
 * monitor into memory before deciding what to drop.
 *
 * Age is the right axis: it is what retention actually means, it leaves the
 * statistics inside the window intact, and it is one bounded query.
 */
const pruneMonitoringLogs = asyncHandler(async (req, res) => {
  const MIN_RETENTION_DAYS = 7;

  const requested = Number(req.body?.olderThanDays ?? req.query?.olderThanDays);
  const days = Number.isFinite(requested) ? Math.trunc(requested) : 30;

  // A floor, not a clamp: asking to keep less than a week is much more likely to
  // be a mistake than an intention, and the deletion cannot be undone.
  if (days < MIN_RETENTION_DAYS) {
    throw new ApiError(400, `olderThanDays must be at least ${MIN_RETENTION_DAYS}`);
  }

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Logs carry no owner of their own, so scope the delete to this user's
  // monitors. Without it a prune would reach across tenants.
  const owned = await Monitoring.find({ owner: req.user._id }).select("_id").lean();

  if (owned.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { deletedCount: 0 }, "No monitors to prune"));
  }

  const result = await MonitoringLog.deleteMany({
    monitoringId: { $in: owned.map((m) => m._id) },
    createdAt: { $lt: cutoff },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { deletedCount: result.deletedCount ?? 0, olderThanDays: days, cutoff },
      `Deleted logs older than ${days} days`
    )
  );
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



/**
 * Sends a test alert through the monitor's configured channels.
 *
 * Delivery config is the part of monitoring that silently rots — a webhook is
 * revoked, an address bounces — and an outage is the worst time to find out.
 */
const testMonitoringAlert = asyncHandler(async (req, res) => {
  const monitoring = await findOwnedMonitor(req.params.id, req.user._id);

  const result = await sendTestAlert(monitoring, req.user);

  const failures = Object.entries(result)
    .filter(([key, value]) => key !== "delivered" && value && value.ok === false)
    .map(([key, value]) => `${key}: ${value.error}`);

  return res.status(200).json(
    new ApiResponse(
      200,
      { delivered: result.delivered, failures },
      result.delivered.length
        ? `Test alert sent via ${result.delivered.join(", ")}`
        : "No channel accepted the test alert"
    )
  );
});

/** Pauses or resumes checks without deleting the monitor's history. */
const setMonitoringPaused = asyncHandler(async (req, res) => {
  const { isPaused } = req.body;

  if (typeof isPaused !== "boolean") {
    throw new ApiError(400, "isPaused must be true or false");
  }

  await findOwnedMonitor(req.params.id, req.user._id);

  const update = { isPaused };

  // Resuming starts from a clean slate: counters left over from before the pause
  // describe a window nobody was watching, and would let one failed check
  // announce an outage.
  if (!isPaused) {
    update["health.consecutiveFailures"] = 0;
    update["health.consecutiveSuccesses"] = 0;
  }

  const monitoring = await Monitoring.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, monitoring, isPaused ? "Monitoring paused" : "Monitoring resumed"));
});

export { createMonitoring, getMonitoringServices, updateMonitoring, deleteMonitoring, getRecentMonitoringLogs, pruneMonitoringLogs, getRCADetails, getLogsForService, getMonitoringService, testMonitoringAlert, setMonitoringPaused };