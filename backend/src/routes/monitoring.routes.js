import { Router } from "express";
import { createMonitoring, getMonitoringServices, updateMonitoring, deleteMonitoring } from "../controllers/monitoring.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secured routes
router.route("/").post(verifyJWT, createMonitoring);
router.route("/").get(verifyJWT, getMonitoringServices);
router.route("/:id").patch(verifyJWT, updateMonitoring);
router.route("/:id").delete(verifyJWT, deleteMonitoring);

export default router;
