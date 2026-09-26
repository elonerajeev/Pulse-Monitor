import Stripe from "stripe";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Lazily construct the Stripe client so the server can boot without billing
// configured. Stripe's constructor throws on a missing key, and doing that at
// import time takes the whole API down.
let stripeClient = null;
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new ApiError(503, "Billing is not configured on this server");
    }
    if (!stripeClient) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
};

const createCheckoutSession = asyncHandler(async (req, res) => {
    const { priceId } = req.body;
    const user = req.user;

    if (!priceId) {
        throw new ApiError(400, "Price ID is required");
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
        const customer = await getStripe().customers.create({
            email: user.email,
            name: user.name,
            metadata: {
                userId: user._id.toString(),
            },
        });
        stripeCustomerId = customer.id;
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
    }

    const session = await getStripe().checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: {
            userId: user._id.toString(),
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { sessionId: session.id, url: session.url }, "Checkout session created"));
});

const stripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    // We need the raw body for Stripe signature verification
    const buffers = [];
    for await (const chunk of req) {
        buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers);

    try {
        event = getStripe().webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            await handleCheckoutSessionCompleted(session);
            break;
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            const subscription = event.data.object;
            await handleSubscriptionUpdated(subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

async function handleCheckoutSessionCompleted(session) {
    const userId = session.metadata.userId;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    const planId = subscription.items.data[0].plan.id;

    let planName = "free";
    if (planId === process.env.STRIPE_PRO_PLAN_ID) planName = "pro";
    else if (planId === process.env.STRIPE_ENTERPRISE_PLAN_ID) planName = "enterprise";

    await User.findByIdAndUpdate(userId, {
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        plan: planName,
        subscriptionStatus: subscription.status,
    });
}

async function handleSubscriptionUpdated(subscription) {
    const customerId = subscription.customer;
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (user) {
        const planId = subscription.items.data[0].plan.id;
        let planName = "free";
        if (subscription.status === "active" || subscription.status === "trialing") {
            if (planId === process.env.STRIPE_PRO_PLAN_ID) planName = "pro";
            else if (planId === process.env.STRIPE_ENTERPRISE_PLAN_ID) planName = "enterprise";
        }

        user.plan = planName;
        user.subscriptionStatus = subscription.status;
        user.stripeSubscriptionId = subscription.id;
        await user.save();
    }
}

const getSubscriptionStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    return res
        .status(200)
        .json(new ApiResponse(200, {
            plan: user.plan,
            status: user.subscriptionStatus,
        }, "Subscription status retrieved"));
});

export {
    createCheckoutSession,
    stripeWebhook,
    getSubscriptionStatus
};
