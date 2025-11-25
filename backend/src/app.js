import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";
import helmet from "helmet"; // Import helmet
import morgan from "morgan"; // Import morgan

// Import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import monitoringRouter from "./routes/monitoring.routes.js";
import userRouter from "./routes/user.routes.js";

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
app.use(helmet()); // Use helmet middleware
app.use(morgan('dev')); // Use morgan for request logging

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json({ limit: "50kb" })); // Increased limit for JSON payloads
app.use(express.urlencoded({ extended: true, limit: "50kb" })); // Increased limit and extended for URL-encoded payloads

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

// Routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/monitoring", monitoringRouter);
app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

export default app;
