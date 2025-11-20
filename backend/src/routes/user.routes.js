import express from "express";
import { updateUserProfile } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// secured routes
router.patch("/update-profile", verifyJWT, updateUserProfile);

export default router;
