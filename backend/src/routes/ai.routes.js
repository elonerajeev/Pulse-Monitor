import { Router } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { chat, digest, aiStatus } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Model calls cost real money, so the assistant gets a tighter budget than the
// app-wide limiter, counted per user rather than per IP.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // verifyJWT runs first, so req.user is always set here; the IP fallback
  // exists only to satisfy the limiter's IPv6-safety check.
  keyGenerator: (req) => (req.user ? String(req.user._id) : ipKeyGenerator(req.ip)),
  message: { success: false, message: "Too many AI requests. Please wait a few minutes." },
});

router.route("/status").get(verifyJWT, aiStatus);
router.route("/chat").post(verifyJWT, aiLimiter, chat);
router.route("/digest").post(verifyJWT, aiLimiter, digest);

export default router;
