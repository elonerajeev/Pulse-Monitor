import mongoose from "mongoose";

const websiteLogSchema = new mongoose.Schema({
  website_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Website",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  response_time: {
    type: Number,
    required: true,
  },
  is_up: {
    type: Boolean,
    required: true,
  },
  checked_at: {
    type: Date,
    default: Date.now,
  },
});

export const WebsiteLog = mongoose.model("WebsiteLog", websiteLogSchema);
