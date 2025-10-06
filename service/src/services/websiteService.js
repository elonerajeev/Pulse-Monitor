import { Website } from "../models/website.model.js";
import { WebsiteLog } from "../models/website_log.model.js";

export const getAllWebsites = async () => {
  const websites = await Website.find({}, "user_id url");
  return websites;
};

export const saveLog = async (log) => {
  const newLog = new WebsiteLog({
    website_id: log.website_id,
    status: log.status,
    response_time: log.responseTime,
    is_up: log.isUp,
  });
  await newLog.save();
};
