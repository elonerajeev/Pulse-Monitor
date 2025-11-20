import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";

// Import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import monitoringRouter from "./routes/monitoring.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

export default app;
