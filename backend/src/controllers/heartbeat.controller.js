import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Heartbeat, generateHeartbeatToken } from "../models/heartbeat.model.js";
import { HeartbeatPing } from "../models/heartbeat_ping.model.js";
import { dueAt, recordPing } from "../services/heartbeatService.js";

/** Loads a heartbeat and proves the caller owns it. */
const findOwned = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid heartbeat ID");
  }

  const heartbeat = await Heartbeat.findById(id);
  if (!heartbeat) throw new ApiError(404, "Heartbeat not found");

  if (heartbeat.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to access this heartbeat");
  }

  return heartbeat;
};

const bounded = (value, { min, max, fallback, label }) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new ApiError(400, `${label} must be a whole number between ${min} and ${max}`);
  }
  return parsed;
};

/** Adds the derived fields a client would otherwise have to recompute. */
const decorate = (heartbeat) => {
  const doc = heartbeat.toObject ? heartbeat.toObject() : heartbeat;
  const due = dueAt(doc);

  return {
    ...doc,
    dueAt: due,
    overdue: Boolean(due && due.getTime() < Date.now()),
    // The ping URL is the whole point of a heartbeat, so hand it back ready to
    // paste into a cron line rather than making the client assemble it.
    pingUrl: `${process.env.API_URL || ""}/api/v1/heartbeats/ping/${doc.token}`,
  };
};

const createHeartbeat = asyncHandler(async (req, res) => {
  const { name, description, expectedIntervalMinutes, graceMinutes, alertChannels } = req.body;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, "Name is required");
  }

  const heartbeat = await Heartbeat.create({
    name: String(name).trim(),
    description,
    owner: req.user._id,
    token: generateHeartbeatToken(),
    expectedIntervalMinutes: bounded(expectedIntervalMinutes, {
      min: 1,
      max: 43200,
      fallback: 60,
      label: "expectedIntervalMinutes",
    }),
    graceMinutes: bounded(graceMinutes, {
      min: 0,
      max: 1440,
      fallback: 5,
      label: "graceMinutes",
    }),
    ...(alertChannels && { alertChannels }),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, decorate(heartbeat), "Heartbeat created successfully"));
});

const getHeartbeats = asyncHandler(async (req, res) => {
  const heartbeats = await Heartbeat.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, heartbeats.map(decorate), "Heartbeats fetched successfully"));
});

const getHeartbeat = asyncHandler(async (req, res) => {
  const heartbeat = await findOwned(req.params.id, req.user._id);

  const pings = await HeartbeatPing.find({ heartbeatId: heartbeat._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, { ...decorate(heartbeat), pings }, "Heartbeat fetched successfully"));
});

const updateHeartbeat = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    expectedIntervalMinutes,
    graceMinutes,
    alertChannels,
    alerting,
    isPaused,
  } = req.body;

  await findOwned(req.params.id, req.user._id);

  const update = {};

  if (name !== undefined) {
    if (!String(name).trim()) throw new ApiError(400, "Name cannot be empty");
    update.name = String(name).trim();
  }
  if (description !== undefined) update.description = description;
  if (expectedIntervalMinutes !== undefined) {
    update.expectedIntervalMinutes = bounded(expectedIntervalMinutes, {
      min: 1,
      max: 43200,
      label: "expectedIntervalMinutes",
    });
  }
  if (graceMinutes !== undefined) {
    update.graceMinutes = bounded(graceMinutes, { min: 0, max: 1440, label: "graceMinutes" });
  }
  if (alertChannels !== undefined) update.alertChannels = alertChannels;
  if (typeof isPaused === "boolean") update.isPaused = isPaused;

  if (alerting && typeof alerting === "object") {
    if ("enabled" in alerting) update["alerting.enabled"] = Boolean(alerting.enabled);
    if ("cooldownMinutes" in alerting) {
      update["alerting.cooldownMinutes"] = bounded(alerting.cooldownMinutes, {
        min: 0,
        max: 1440,
        label: "cooldownMinutes",
      });
    }
  }

  const heartbeat = await Heartbeat.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, decorate(heartbeat), "Heartbeat updated successfully"));
});

const deleteHeartbeat = asyncHandler(async (req, res) => {
  const heartbeat = await findOwned(req.params.id, req.user._id);

  await Heartbeat.findByIdAndDelete(heartbeat._id);
  await HeartbeatPing.deleteMany({ heartbeatId: heartbeat._id });

  return res.status(200).json(new ApiResponse(200, {}, "Heartbeat deleted successfully"));
});

/**
 * Issues a fresh token, invalidating the old one.
 *
 * The token is a bearer secret that ends up pasted into cron lines and CI
 * configs, so it needs a rotation path that does not mean recreating the
 * heartbeat and losing its history.
 */
const rotateHeartbeatToken = asyncHandler(async (req, res) => {
  await findOwned(req.params.id, req.user._id);

  const heartbeat = await Heartbeat.findByIdAndUpdate(
    req.params.id,
    { $set: { token: generateHeartbeatToken() } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, decorate(heartbeat), "Heartbeat token rotated"));
});

/**
 * Public check-in endpoint.
 *
 * Unauthenticated by design — the token in the path is the credential, because
 * the callers are cron lines and CI steps that cannot hold a session. It is
 * therefore rate limited, and it never reveals whether an unknown token was
 * merely wrong or belonged to a deleted heartbeat.
 */
const pingHeartbeat = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const source = req.query.source || req.body?.source;
  const state = req.query.state || req.body?.state;

  const result = await recordPing(token, {
    state,
    source,
    message: req.query.msg || req.body?.message,
    durationMs: req.query.duration ?? req.body?.durationMs,
  });

  if (!result.found) {
    throw new ApiError(404, "Unknown heartbeat token");
  }

  // Plain text: the caller is usually `curl` in a cron line, and a JSON envelope
  // is noise in a job log.
  return res.status(200).type("text/plain").send("ok");
});

export {
  createHeartbeat,
  getHeartbeats,
  getHeartbeat,
  updateHeartbeat,
  deleteHeartbeat,
  rotateHeartbeatToken,
  pingHeartbeat,
};
