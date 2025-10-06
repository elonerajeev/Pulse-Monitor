import cron from "node-cron";
import { getAllWebsites, saveLog } from "../services/websiteService.js";
import { pingWebsite } from "../utils/pingWebsite.js";

export const startMonitoring = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("🔍 Checking all websites...");
    const websites = await getAllWebsites();

    for (const site of websites) {
      const result = await pingWebsite(site.url);
      await saveLog({ website_id: site.id, ...result });
      console.log(`✅ ${site.url} - ${result.status}`);
    }
  });
};
