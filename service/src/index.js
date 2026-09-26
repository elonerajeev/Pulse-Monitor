import 'dotenv/config.js';
import express from "express";
import db from "./config/db.js";
import routes from "./routes/index.js";
import { startMonitoring } from "./jobs/monitorJob.js";
import { startSslJob } from "./jobs/sslJob.js";
import { startHeartbeatJob } from "./jobs/heartbeatJob.js";
import { startReportJob } from "./jobs/reportJob.js";
import { startCleanupJob } from "./jobs/cleanupJob.js";
import { isEmailConfigured, missingEmailConfig } from "./services/emailService.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "64kb" }));
app.use("/api", routes);

const server = app.listen(port, () => {
  console.log(`Worker listening on port ${port}`);
});

(async () => {
  try {
    await db();

    // Say so at boot rather than discovering it during an outage.
    if (!isEmailConfigured()) {
      console.warn(
        `⚠️  Email is not configured (missing ${missingEmailConfig().join(", ")}). ` +
          `Alerts will be delivered to webhooks only.`
      );
    }

    await startMonitoring();
    startHeartbeatJob();
    startSslJob();
    startReportJob();
    startCleanupJob();

    console.log("All jobs scheduled.");
  } catch (error) {
    // Without a database there is nothing to monitor, and a process that stays
    // up in that state reports healthy while doing nothing.
    console.error("FATAL: worker failed to start:", error.message);
    process.exit(1);
  }
})();

// Render and most schedulers send SIGTERM before replacing an instance. Closing
// the listener first lets in-flight health checks finish.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
