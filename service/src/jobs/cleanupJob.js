import cron from "node-cron";
import { deleteOldMonitoringLogs } from "../services/monitoringService.js";

export const startCleanupJob = () => {
  // This cron job runs every day at midnight to delete old monitoring logs.
  cron.schedule("0 0 * * *", async () => {
    console.log("\n-- Running Cleanup Job --");
    try {
      const result = await deleteOldMonitoringLogs();
      console.log(`   - Deleted ${result.deletedCount} old monitoring logs.`);
    } catch (error) {
      console.error(`   - FATAL: An unexpected error occurred during cleanup: ${error.message}`);
    }
    console.log("\n-- Cleanup Job Finished --");
  });
};
