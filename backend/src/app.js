import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initWebSocket } from './websocket.js'; // Import WebSocket initializer

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from 'express-rate-limit';

// Import error handling
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware.js";
import correlationIdMiddleware from "./middlewares/correlationId.middleware.js";
import requestLoggerMiddleware from "./middlewares/requestLogger.middleware.js";

// Import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import monitoringRouter from "./routes/monitoring.routes.js";
import userRouter from "./routes/user.routes.js";
import maintenanceWindowRouter from "./routes/maintenanceWindow.routes.js";
import trafficRouter from "./routes/traffic.routes.js";
import stripeRouter from "./routes/stripe.routes.js";
<<<<<<< HEAD
import multiRegionMonitoringRouter from "./routes/multiRegionMonitoring.routes.js";
import slaConfigurationRouter from "./routes/slaConfiguration.routes.js";
import incidentRouter from "./routes/incident.routes.js";
import alertRuleRouter from "./routes/alertRule.routes.js";
import teamRouter from "./routes/team.routes.js";
import apiKeyRouter from "./routes/apiKey.routes.js";
=======
import aiRouter from "./routes/ai.routes.js";
import publicRouter from "./routes/public.routes.js";
import heartbeatRouter from "./routes/heartbeat.routes.js";
import reportRouter from "./routes/report.routes.js";
import { issueCsrfToken, verifyCsrfToken, getCsrfToken } from "./middlewares/csrf.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
>>>>>>> e02f133 (updated)

const app = express();

// Add correlation ID to all requests (must be first)
app.use(correlationIdMiddleware);

// Add request logging (before rate limiter to capture all requests)
app.use(requestLoggerMiddleware);

// Rate limiter
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	skip: (req) => req.path === '/api/v1/healthcheck', // Skip health checks
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			errorCode: 'RATE_001',
			message: 'Too many requests from this IP, please try again later.',
			retryAfter: req.rateLimit.resetTime,
		});
	},
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

const allowedOrigins = [
    'https://pulsemonitorlog.netlify.app',
    'https://automatic-fortnight-x55wgj9vxrq29v5j-5173.app.github.dev',
    'https://5173-firebase-server-1759253299248.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev',
    'https://server-81845678-b0224.web.app',
    'https://www.pulsemonitorlog.com',
    'https://pulsemonitorlog.com',
<<<<<<< HEAD
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
=======
    // Local development
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    // Anything extra supplied by the environment (comma separated)
    ...(process.env.CORS_ORIGIN || '*')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
>>>>>>> e02f133 (updated)
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
            console.log("Refresh a page once")
        }
    },
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Origin, Accept, X-XSRF-TOKEN',
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));

app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use((req, res, next) => {
    if (req.originalUrl === "/api/v1/stripe/webhook") {
        next();
    } else {
        express.json({ limit: "50kb" })(req, res, next);
    }
});
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

// CSRF Protection (double-submit cookie)
app.use(issueCsrfToken);
app.use(verifyCsrfToken);

// Routes declaration
app.get("/api/v1/csrf-token", getCsrfToken);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/monitoring", monitoringRouter);
app.use("/api/v1/monitoring", multiRegionMonitoringRouter);
app.use("/api/v1/monitoring", slaConfigurationRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/maintenance-windows", maintenanceWindowRouter);
app.use("/api/v1/traffic", trafficRouter);
app.use("/api/v1/stripe", stripeRouter);
<<<<<<< HEAD
app.use("/api/v1/incidents", incidentRouter);
app.use("/api/v1/alerts", alertRuleRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/api-keys", apiKeyRouter);
=======
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/public", publicRouter);
app.use("/api/v1/heartbeats", heartbeatRouter);
app.use("/api/v1/reports", reportRouter);
>>>>>>> e02f133 (updated)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

<<<<<<< HEAD
// 404 Not Found Handler (MUST be before error handler)
app.use(notFoundHandler);

// Global Error Handler (MUST be last)
=======
app.use(notFoundHandler);
>>>>>>> e02f133 (updated)
app.use(errorHandler);

// Initialize WebSocket and create the server
const server = initWebSocket(app);

export default server;
