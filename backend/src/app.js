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

// Import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import monitoringRouter from "./routes/monitoring.routes.js";
import userRouter from "./routes/user.routes.js";
import maintenanceWindowRouter from "./routes/maintenanceWindow.routes.js";
import trafficRouter from "./routes/traffic.routes.js";

const app = express();

const allowedOrigins = [
    'https://pulse-monitor-frontend.onrender.com',
    'http://localhost:5173',
    'https://5173-firebase-server-1759253299248.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev',
    'https://5000-firebase-server-1759253299248.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
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
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

// Routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/monitoring", monitoringRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/maintenance-windows", maintenanceWindowRouter);
app.use("/api/v1/traffic", trafficRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Initialize WebSocket and create the server
const server = initWebSocket(app);

export default server;
