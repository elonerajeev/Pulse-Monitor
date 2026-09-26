import { Router } from "express";
import { getPublicStatus, getUptimeBadge } from "../controllers/public.controller.js";

// No verifyJWT here by design — these back the shared status page and embeddable
// badges. Access control lives in the queries, which only ever match monitors
// the owner marked public.
const router = Router();

router.route("/status/:slug").get(getPublicStatus);
router.route("/badge/:id").get(getUptimeBadge);

export default router;
