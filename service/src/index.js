import { startMonitoring } from "./jobs/monitorJob.js";
import db from "./config/db.js";

(async () => {
  await db();
  startMonitoring();
})();
