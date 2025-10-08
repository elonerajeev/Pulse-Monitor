import 'dotenv/config.js';
import express from "express";
import { startMonitoring } from "./jobs/monitorJob.js";
import db from "./config/db.js";
import routes from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use("/api", routes);

(async () => {
  await db();
  startMonitoring();
})();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});