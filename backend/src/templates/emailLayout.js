/**
 * Shared chrome for every transactional email.
 *
 * Everything interpolated here is escaped. Alert emails carry monitor names,
 * target URLs and error text echoed from remote servers — all attacker- or
 * user-influenced, and none of it safe to drop into HTML raw.
 */

const ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes a value for interpolation into HTML. */
export const esc = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
};

export const ACCENTS = {
  danger: "#d13438",
  warning: "#b7791f",
  success: "#1a7f4b",
  neutral: "#0a0a0a",
};

/** Renders a two-column label/value table. Values are escaped. */
export const kvTable = (rows) => {
  const cells = rows
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;width:40%;vertical-align:top;">${esc(label)}</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${esc(value)}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" style="border-collapse:collapse;margin:16px 0;">${cells}</table>`;
};

/**
 * Renders a data grid. Header cells are escaped; each row cell may opt into raw
 * HTML by passing { html } so callers can colour a value they built themselves.
 */
export const dataTable = (headers, rows) => {
  const head = headers
    .map(
      (h) =>
        `<th align="left" style="padding:10px 8px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">${esc(h)}</th>`
    )
    .join("");

  const body = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">${
                cell && typeof cell === "object" && "html" in cell ? cell.html : esc(cell)
              }</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" style="border-collapse:collapse;margin:16px 0;">
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
};

/**
 * Wraps pre-built body HTML in the PulseMonitor shell.
 * `bodyHtml` is inserted verbatim, so callers must have escaped it already —
 * use esc/kvTable/dataTable rather than string concatenation.
 */
export const renderEmail = ({
  title,
  heading,
  accent = ACCENTS.neutral,
  intro = "",
  bodyHtml = "",
  ctaText,
  ctaUrl,
  footerNote = "",
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" style="border-collapse:collapse;background-color:#f4f5f7;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background-color:#0a0a0a;padding:20px 28px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.01em;">PulseMonitor</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:${accent};">${esc(heading)}</h1>
              ${intro ? `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#374151;">${esc(intro)}</p>` : ""}
              ${bodyHtml}
              ${
                ctaText && ctaUrl
                  ? `<p style="margin:24px 0 0;">
                       <a href="${esc(ctaUrl)}" style="display:inline-block;background-color:#0a0a0a;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:6px;font-size:14px;font-weight:600;">${esc(ctaText)}</a>
                     </p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background-color:#fafafa;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                ${footerNote ? `${esc(footerNote)}<br>` : ""}
                Sent by PulseMonitor. You are receiving this because you own this monitor.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
