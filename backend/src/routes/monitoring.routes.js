import { Router } from "express";
import {
  createMonitoring,
  getMonitoringServices,
  updateMonitoring,
  deleteMonitoring,
  getRecentMonitoringLogs,
  pruneMonitoringLogs,
  getRCADetails,
  getLogsForService,
  getMonitoringService
} from "../controllers/monitoring.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secured routes
router.route("/").post(verifyJWT, createMonitoring);
router.route("/").get(verifyJWT, getMonitoringServices);
router.route("/logs/recent").get(verifyJWT, getRecentMonitoringLogs);
router.route("/prune-logs").post(verifyJWT, pruneMonitoringLogs);
router.route("/rca/:logId").get(verifyJWT, getRCADetails);
router.route("/:id/logs").get(verifyJWT, getLogsForService);
router.route("/:id").get(verifyJWT, getMonitoringService);
router.route("/:id").patch(verifyJWT, updateMonitoring);
router.route("/:id").delete(verifyJWT, deleteMonitoring);

export default router;
