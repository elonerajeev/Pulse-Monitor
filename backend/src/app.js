import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";

// Import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import monitoringRouter from "./routes/monitoring.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Custom CORS Middleware ---
// This is a more direct approach to handling CORS.

app.use(cors())
app.use((req, res, next) => {
    // Set a very permissive origin. In a real production app, you'd want to restrict
    // this to your actual frontend domain.
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Allowed HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    
    // Allowed headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
    
    // Allow credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle the preflight 'OPTIONS' request.
    // The browser sends this before the actual request to check if it's safe to proceed.
    if (req.method === 'OPTIONS') {
        return res.status(204).end(); // 204 No Content - success, but no data to send back
    }
    
    next();
});


app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

// Routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/monitoring", monitoringRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

export default app;
