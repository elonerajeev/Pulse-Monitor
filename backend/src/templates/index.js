import { renderEmail, kvTable, dataTable, esc, ACCENTS } from "./emailLayout.js";

const appUrl = () =>
  (process.env.APP_URL || "https://www.pulsemonitorlog.com").replace(/\/+$/, "");

const formatUptime = (value) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(2)}%`;

const formatMs = (value) =>
  value === null || value === undefined ? "—" : `${Math.round(value)} ms`;

/** Incident alert — a monitor changed confirmed state. */
const alert = (data) => {
  const recovered = String(data.status).toLowerCase() === "online";

  return renderEmail({
    title: `${data.serviceName} is ${data.status}`,
    heading: recovered
      ? `${data.serviceName} has recovered`
      : `${data.serviceName} is ${data.status}`,
    accent: recovered ? ACCENTS.success : ACCENTS.danger,
    intro: recovered
      ? `Hi ${data.userName}, the service is responding normally again.`
      : `Hi ${data.userName}, we could not get a healthy response from this service.`,
    bodyHtml: kvTable([
      ["Service", data.serviceName],
      ["Target", data.serviceTarget],
      ["Status", data.status],
      ["Previous status", data.previousStatus],
      ["Detected at", data.timestamp],
      ["Response time", data.responseTime],
      ["Region", data.region],
      ["Reason", data.error],
      ["Confirmed after", data.confirmations],
    ]),
    ctaText: "Open dashboard",
    ctaUrl: `${appUrl()}/dashboard/monitoring`,
    footerNote: recovered
      ? ""
      : "Adjust confirmations and cooldown on the monitor to change when this fires.",
  });
};

/** Sent once when a monitor is created. */
const serviceAdded = (data) =>
  renderEmail({
    title: `Monitoring started for ${data.serviceName}`,
    heading: `Now monitoring ${data.serviceName}`,
    accent: ACCENTS.success,
    intro: `Hi ${data.userName}, PulseMonitor has started checking this service.`,
    bodyHtml: kvTable([
      ["Service", data.serviceName],
      ["Target", data.serviceTarget],
      ["Check interval", data.interval ? `Every ${data.interval} minute(s)` : null],
    ]),
    ctaText: "View service",
    ctaUrl: `${appUrl()}/dashboard/services`,
  });

/** TLS certificate approaching expiry. */
const sslExpiry = (data) => {
  const days = Number(data.daysUntilExpiry);
  const expired = days <= 0;

  return renderEmail({
    title: `TLS certificate for ${data.serviceName}`,
    heading: expired
      ? `The certificate for ${data.serviceName} has expired`
      : `Certificate for ${data.serviceName} expires in ${days} day${days === 1 ? "" : "s"}`,
    accent: expired || days <= 7 ? ACCENTS.danger : ACCENTS.warning,
    intro: expired
      ? `Hi ${data.userName}, visitors are seeing a security warning on this site right now.`
      : `Hi ${data.userName}, renew this certificate before it lapses.`,
    bodyHtml: kvTable([
      ["Service", data.serviceName],
      ["Target", data.serviceTarget],
      ["Expires", data.validTo],
      ["Days remaining", expired ? "Expired" : days],
      ["Issuer", data.issuer],
    ]),
    ctaText: "Open dashboard",
    ctaUrl: `${appUrl()}/dashboard/services`,
    footerNote: "Turn off certificate warnings in your profile notification settings.",
  });
};

/** A heartbeat missed its window, or checked in again. */
const heartbeat = (data) => {
  const recovered = String(data.state).toLowerCase() === "up";

  return renderEmail({
    title: `Heartbeat ${data.name} is ${data.state}`,
    heading: recovered
      ? `${data.name} checked in again`
      : `${data.name} missed its check-in`,
    accent: recovered ? ACCENTS.success : ACCENTS.danger,
    intro: recovered
      ? `Hi ${data.userName}, this job reported in and is back on schedule.`
      : `Hi ${data.userName}, this job did not report in within its expected window.`,
    bodyHtml: kvTable([
      ["Heartbeat", data.name],
      ["Expected every", data.expectedInterval],
      ["Grace period", data.grace],
      ["Last check-in", data.lastPingAt || "Never"],
      ["Overdue by", data.overdueBy],
      ["Reported message", data.message],
    ]),
    ctaText: "View heartbeats",
    ctaUrl: `${appUrl()}/dashboard/heartbeats`,
  });
};

/** Weekly uptime digest across every monitor an account owns. */
const weeklyReport = (data) => {
  const rows = (data.monitors || []).map((m) => {
    const uptime = m.uptime;
    const colour =
      uptime === null ? "#6b7280" : uptime >= 99.9 ? "#1a7f4b" : uptime >= 99 ? "#b7791f" : "#d13438";

    return [
      m.name,
      { html: `<span style="color:${colour};font-weight:600;">${esc(formatUptime(uptime))}</span>` },
      formatMs(m.avgResponseTime),
      String(m.incidents ?? 0),
      String(m.checks ?? 0),
    ];
  });

  const summary = kvTable([
    ["Period", data.period],
    ["Monitors", data.monitorCount],
    ["Overall uptime", formatUptime(data.overallUptime)],
    ["Incidents", data.totalIncidents],
    ["Checks run", data.totalChecks],
  ]);

  const table = rows.length
    ? dataTable(["Monitor", "Uptime", "Avg response", "Incidents", "Checks"], rows)
    : `<p style="margin:16px 0;font-size:14px;color:#6b7280;">No checks were recorded this period.</p>`;

  return renderEmail({
    title: `Weekly uptime report`,
    heading: "Your weekly uptime report",
    accent: ACCENTS.neutral,
    intro: `Hi ${data.userName}, here is how your services performed.`,
    bodyHtml: summary + table,
    ctaText: "Open dashboard",
    ctaUrl: `${appUrl()}/dashboard/overview`,
    footerNote: "Turn off weekly reports in your profile notification settings.",
  });
};

/** Operator-triggered delivery check for a monitor's alert channels. */
const testAlert = (data) =>
  renderEmail({
    title: "PulseMonitor test alert",
    heading: "Test alert delivered",
    accent: ACCENTS.success,
    intro: `Hi ${data.userName}, this confirms alerts for this monitor reach you.`,
    bodyHtml: kvTable([
      ["Service", data.serviceName],
      ["Target", data.serviceTarget],
      ["Channels", data.channels],
      ["Sent at", data.timestamp],
    ]),
    footerNote: "This message was triggered manually and does not indicate an incident.",
  });

export const renderers = {
  alert,
  serviceAdded,
  sslExpiry,
  heartbeat,
  weeklyReport,
  testAlert,
};

export default renderers;
