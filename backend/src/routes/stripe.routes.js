import { Router } from "express";
import {
    createCheckoutSession,
    stripeWebhook,
    getSubscriptionStatus
} from "../controllers/stripe.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express";

const router = Router();

// Webhook needs raw body, should be handled accordingly
router.route("/webhook").post(stripeWebhook);

router.route("/create-checkout-session").post(verifyJWT, createCheckoutSession);
router.route("/status").get(verifyJWT, getSubscriptionStatus);

export default router;
