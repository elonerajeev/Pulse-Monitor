import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initWebSocket } from './websocket.js'; // Import WebSocket initializer

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
import multiRegionMonitoringRouter from "./routes/multiRegionMonitoring.routes.js";
import slaConfigurationRouter from "./routes/slaConfiguration.routes.js";
import incidentRouter from "./routes/incident.routes.js";
import alertRuleRouter from "./routes/alertRule.routes.js";
import teamRouter from "./routes/team.routes.js";
import apiKeyRouter from "./routes/apiKey.routes.js";

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
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
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
    allowedHeaders: 'Content-Type, Authorization, Origin, Accept',
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

// CSRF Protection
// Note: For a real production app, you'd use a more robust CSRF solution,
// but to satisfy CodeQL and provide basic protection:
app.use((req, res, next) => {
    const token = req.cookies['XSRF-TOKEN'];
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) &&
        req.originalUrl !== "/api/v1/stripe/webhook") {
        const headerToken = req.headers['x-xsrf-token'];
        if (!token || token !== headerToken) {
            return res.status(403).json({ message: "Invalid CSRF token" });
        }
    }
    next();
});

// Routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/monitoring", monitoringRouter);
app.use("/api/v1/monitoring", multiRegionMonitoringRouter);
app.use("/api/v1/monitoring", slaConfigurationRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/maintenance-windows", maintenanceWindowRouter);
app.use("/api/v1/traffic", trafficRouter);
app.use("/api/v1/stripe", stripeRouter);
app.use("/api/v1/incidents", incidentRouter);
app.use("/api/v1/alerts", alertRuleRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/api-keys", apiKeyRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// 404 Not Found Handler (MUST be before error handler)
app.use(notFoundHandler);

// Global Error Handler (MUST be last)
app.use(errorHandler);

// Initialize WebSocket and create the server
const server = initWebSocket(app);

export default server;
