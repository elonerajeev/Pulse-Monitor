const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // Add this

// Import routes
const healthcheckRouter = require("./routes/healthcheck.routes");
const authRouter = require("./routes/auth.routes");

// ...... add Here other route .......

const app = express();

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  exposedHeaders: ["Authorization"],
};

// View engine setup (if using templates)
app.set("view engine", "ejs"); // or "pug", "hbs"
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Static files - Serve multiple directories
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

app.use(cookieParser());

// Routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
// ...... add Here other route .......

module.exports = app;
