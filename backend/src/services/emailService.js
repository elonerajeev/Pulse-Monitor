import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { renderers } from "../templates/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The two apps keep their .env in different places (backend/src/.env,
// service/.env). Load whichever exists rather than hard-coding one path — the
// previous hard-coded path pointed at a file that does not exist in the
// backend, so every backend email failed silently.
for (const candidate of [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
]) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

const requiredVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "FROM_EMAIL"];

/** True when this process has everything it needs to send mail. */
export const isEmailConfigured = () => requiredVars.every((key) => Boolean(process.env[key]));

/** Which settings are missing, for a diagnostic that names the actual problem. */
export const missingEmailConfig = () => requiredVars.filter((key) => !process.env[key]);

let transporter = null;

// Built on first use so an unconfigured deployment reports a clear error at
// send time instead of failing at import and taking the process down.
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Sends one templated email.
 *
 * Returns a result rather than throwing: a failed alert email must not abort
 * the surrounding check or job. Callers log the outcome.
 */
export const sendEmail = async (to, subject, template, data = {}) => {
  const render = renderers[template];

  if (!render) {
    const error = `Unknown email template "${template}"`;
    console.error(`❌ ${error}`);
    return { ok: false, error };
  }

  if (!to) {
    return { ok: false, error: "No recipient address" };
  }

  if (!isEmailConfigured()) {
    const error = `Email is not configured (missing ${missingEmailConfig().join(", ")})`;
    console.warn(`⚠️  Skipping "${subject}" — ${error}`);
    return { ok: false, skipped: true, error };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"PulseMonitor" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: render(data),
    });

    console.log(`✅ Email sent: "${subject}" (${info.messageId})`);
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send "${subject}":`, error.message);
    return { ok: false, error: error.message };
  }
};
