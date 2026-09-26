import axios from "axios";
import { sendEmail } from "./emailService.js";

const WEBHOOK_TIMEOUT_MS = 8000;

// Hostnames that must never be reachable from a user-supplied webhook URL.
// Webhook targets are attacker-controllable input; without this, a monitor
// could be pointed at cloud metadata or an internal service.
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /\.internal$/i,
  /\.local$/i,
];

/** Rejects webhook URLs that are malformed or point somewhere private. */
const isSafeWebhookUrl = (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  return !BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname));
};

/**
 * Posts to one webhook. Never throws — a broken Slack URL must not stop the
 * email alert or the check that triggered it.
 */
const postWebhook = async (channel, url, payload) => {
  if (!isSafeWebhookUrl(url)) {
    console.warn(`⚠️  Skipping ${channel} webhook: URL is not a public https endpoint`);
    return { ok: false, error: "unsafe_url" };
  }

  try {
    await axios.post(url, payload, { timeout: WEBHOOK_TIMEOUT_MS });
    return { ok: true };
  } catch (error) {
    console.error(`❌ Failed to send ${channel} alert:`, error.message);
    return { ok: false, error: error.message };
  }
};

/** Fans one message out to whichever webhooks are enabled. */
const dispatchWebhooks = async (alertChannels, { slackText, discordText }) => {
  const results = {};

  if (alertChannels?.slack?.enabled && alertChannels?.slack?.webhookUrl) {
    results.slack = await postWebhook("Slack", alertChannels.slack.webhookUrl, {
      text: slackText,
    });
  }

  if (alertChannels?.discord?.enabled && alertChannels?.discord?.webhookUrl) {
    results.discord = await postWebhook("Discord", alertChannels.discord.webhookUrl, {
      content: discordText,
    });
  }

  return results;
};

/** Names the channels that actually attempted delivery, for reporting back. */
const deliveredChannels = (emailResult, webhookResults) => {
  const names = [];
  if (emailResult?.ok) names.push("email");
  if (webhookResults.slack?.ok) names.push("slack");
  if (webhookResults.discord?.ok) names.push("discord");
  return names;
};

const describeError = (error) => {
  if (!error) return "N/A";
  if (typeof error === "string") return error;
  return error.message || "N/A";
};

/**
 * Incident alert for a confirmed status change.
 *
 * Suppression decisions (confirmation, cooldown, maintenance) are made by the
 * caller — by the time this runs the alert has already been judged worth
 * sending.
 */
export const sendAlert = async (monitoring, status, result, user, options = {}) => {
  const { name, target, alertChannels, alerting } = monitoring;
  const timestamp = new Date().toUTCString();
  const recovered = status === "online";
  const icon = recovered ? "✅" : "🚨";

  const emailResult =
    options.email === false
      ? { ok: false, skipped: true, error: "opted_out" }
      : await sendEmail(user.email, `PulseMonitor: ${name} is ${status}`, "alert", {
          userName: user.name,
          serviceName: name,
          serviceTarget: target,
          status,
          previousStatus: options.previousStatus,
          timestamp,
          responseTime: result.responseTime ? `${Math.round(result.responseTime)} ms` : "—",
          error: describeError(result.error),
          region: result.region || "—",
          confirmations: recovered
            ? null
            : `${alerting?.confirmations ?? 2} consecutive failed check(s)`,
        });

  const summary = [
    `${icon} *PulseMonitor*`,
    `*Service:* ${name}`,
    `*Target:* ${target}`,
    `*Status:* ${status}`,
    `*Reason:* ${describeError(result.error)}`,
    `*Region:* ${result.region || "—"}`,
    `*Time:* ${timestamp}`,
  ].join("\n");

  const webhookResults = await dispatchWebhooks(alertChannels, {
    slackText: summary,
    discordText: summary.replace(/\*/g, "**"),
  });

  return { email: emailResult, ...webhookResults };
};

/** Certificate expiry warning at a configured threshold. */
export const sendSslAlert = async (monitoring, user, ssl) => {
  const { name, target, alertChannels } = monitoring;
  const days = ssl.daysUntilExpiry;
  const expired = days <= 0;

  const emailResult =
    user.notificationPrefs?.sslExpiry === false
      ? { ok: false, skipped: true, error: "opted_out" }
      : await sendEmail(
          user.email,
          expired
            ? `PulseMonitor: TLS certificate for ${name} has expired`
            : `PulseMonitor: TLS certificate for ${name} expires in ${days} day(s)`,
          "sslExpiry",
          {
            userName: user.name,
            serviceName: name,
            serviceTarget: target,
            daysUntilExpiry: days,
            validTo: ssl.validTo ? new Date(ssl.validTo).toUTCString() : "—",
            issuer: ssl.issuer || "—",
          }
        );

  const summary = [
    `${expired ? "🔴" : "⚠️"} *PulseMonitor — TLS certificate*`,
    `*Service:* ${name}`,
    `*Target:* ${target}`,
    expired ? "*Status:* Expired" : `*Expires in:* ${days} day(s)`,
    `*Expires:* ${ssl.validTo ? new Date(ssl.validTo).toUTCString() : "—"}`,
  ].join("\n");

  const webhookResults = await dispatchWebhooks(alertChannels, {
    slackText: summary,
    discordText: summary.replace(/\*/g, "**"),
  });

  return { email: emailResult, ...webhookResults };
};

/** Missed or resumed check-in for a heartbeat. */
export const sendHeartbeatAlert = async (heartbeat, user, state, context = {}) => {
  const { name, alertChannels } = heartbeat;
  const recovered = state === "up";

  const emailResult =
    user.notificationPrefs?.incidentEmails === false
      ? { ok: false, skipped: true, error: "opted_out" }
      : await sendEmail(
          user.email,
          recovered
            ? `PulseMonitor: ${name} checked in again`
            : `PulseMonitor: ${name} missed its check-in`,
          "heartbeat",
          {
            userName: user.name,
            name,
            state,
            expectedInterval: `Every ${heartbeat.expectedIntervalMinutes} minute(s)`,
            grace: `${heartbeat.graceMinutes} minute(s)`,
            lastPingAt: heartbeat.lastPingAt
              ? new Date(heartbeat.lastPingAt).toUTCString()
              : null,
            overdueBy: context.overdueBy,
            message: context.message,
          }
        );

  const summary = [
    `${recovered ? "✅" : "🚨"} *PulseMonitor — Heartbeat*`,
    `*Job:* ${name}`,
    `*Status:* ${recovered ? "checked in" : "missed check-in"}`,
    `*Expected every:* ${heartbeat.expectedIntervalMinutes} minute(s)`,
    context.overdueBy ? `*Overdue by:* ${context.overdueBy}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const webhookResults = await dispatchWebhooks(alertChannels, {
    slackText: summary,
    discordText: summary.replace(/\*/g, "**"),
  });

  return { email: emailResult, ...webhookResults };
};

/**
 * Operator-triggered delivery check. Proves the configured channels work
 * without waiting for a real outage.
 */
export const sendTestAlert = async (monitoring, user) => {
  const { name, target, alertChannels } = monitoring;
  const timestamp = new Date().toUTCString();

  const summary = [
    "🔔 *PulseMonitor — Test alert*",
    `*Service:* ${name}`,
    `*Target:* ${target}`,
    `*Time:* ${timestamp}`,
    "This is a manual test. No incident is in progress.",
  ].join("\n");

  const webhookResults = await dispatchWebhooks(alertChannels, {
    slackText: summary,
    discordText: summary.replace(/\*/g, "**"),
  });

  const emailResult = await sendEmail(
    user.email,
    `PulseMonitor: test alert for ${name}`,
    "testAlert",
    {
      userName: user.name,
      serviceName: name,
      serviceTarget: target,
      channels: deliveredChannels(null, webhookResults).join(", ") || "email only",
      timestamp,
    }
  );

  return {
    email: emailResult,
    ...webhookResults,
    delivered: deliveredChannels(emailResult, webhookResults),
  };
};
