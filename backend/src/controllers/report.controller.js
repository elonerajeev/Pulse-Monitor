import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { buildReport, sendReport } from "../services/reportService.js";

const MAX_WINDOW_DAYS = 90;

/**
 * Resolves the reporting window.
 *
 * Capped because the aggregation scans every log in the range; an uncapped
 * `days` lets one request walk the whole retention period.
 */
const resolveWindow = (query) => {
  const requested = Number(query.days);
  const days = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), MAX_WINDOW_DAYS)
    : 7;

  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);

  return { since, until, days };
};

/** Returns the same numbers the weekly email would contain, as JSON. */
const getReportPreview = asyncHandler(async (req, res) => {
  const { since, until, days } = resolveWindow(req.query);

  const report = await buildReport(req.user._id, { since, until });

  return res
    .status(200)
    .json(new ApiResponse(200, { ...report, days }, "Report generated successfully"));
});

/** Emails the report now, so the user can see what the weekly one looks like. */
const sendReportNow = asyncHandler(async (req, res) => {
  const { since, until } = resolveWindow(req.query);

  const report = await buildReport(req.user._id, { since, until });

  if (report.monitorCount === 0) {
    throw new ApiError(400, "Add a monitor before requesting a report");
  }

  const result = await sendReport(req.user, report);

  if (!result.ok) {
    throw new ApiError(
      result.skipped ? 503 : 502,
      result.error || "The report could not be sent"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { sentTo: req.user.email }, "Report sent"));
});

export { getReportPreview, sendReportNow };
