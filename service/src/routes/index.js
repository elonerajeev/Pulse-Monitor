import { Router } from "express";
import { getMonitoringLogs } from "../services/monitoringService.js";

const router = Router();

router.get("/monitoring-logs/:monitoringId", async (req, res) => {
  try {
    const logs = await getMonitoringLogs(req.params.monitoringId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;