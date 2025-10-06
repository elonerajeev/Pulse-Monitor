import { Router } from "express";
import { createMonitoring, getMonitoringServices } from "../controllers/monitoring.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secured routes
router.route("/add").post(verifyJWT, createMonitoring);
router.route("/").get(verifyJWT, getMonitoringServices);

export default router;
