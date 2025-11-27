import { Router } from "express";
import { getTrafficData } from "../controllers/traffic.controller.js";

const router = Router();

router.get("/", getTrafficData);

export default router;
