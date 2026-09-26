import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { getReportPreview, sendReportNow } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Each send-now is an outbound email and a full aggregation, so it gets a much
// tighter budget than a read.
const sendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Report already requested recently, try again later." },
});

router.route("/preview").get(verifyJWT, getReportPreview);
router.route("/send").post(verifyJWT, sendLimiter, sendReportNow);

export default router;
