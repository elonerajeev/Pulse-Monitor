import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  createHeartbeat,
  getHeartbeats,
  getHeartbeat,
  updateHeartbeat,
  deleteHeartbeat,
  rotateHeartbeatToken,
  pingHeartbeat,
} from "../controllers/heartbeat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * The ping endpoint is unauthenticated (the token is the credential) and is the
 * only route here reachable without a session, so it gets its own budget. It is
 * generous enough for a job that pings on every run, and tight enough that the
 * token space cannot be swept.
 */
const pingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many check-ins, slow down." },
});

// Public check-in. GET for cron/curl, POST for callers that send a payload.
router.route("/ping/:token").get(pingLimiter, pingHeartbeat).post(pingLimiter, pingHeartbeat);

// Secured routes
router.route("/").post(verifyJWT, createHeartbeat);
router.route("/").get(verifyJWT, getHeartbeats);
router.route("/:id").get(verifyJWT, getHeartbeat);
router.route("/:id").patch(verifyJWT, updateHeartbeat);
router.route("/:id").delete(verifyJWT, deleteHeartbeat);
router.route("/:id/rotate-token").post(verifyJWT, rotateHeartbeatToken);

export default router;
