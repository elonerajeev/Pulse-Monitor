
// test-email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { alertTemplate } from "./src/templates/alertTemplate.js";

// Load .env from the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Log to verify env variables
console.log("✅ Loaded SMTP_HOST:", process.env.SMTP_HOST);

const populateTemplate = (template, data) => {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    return data[key.trim()] || '';
  });
};


async function sendTestEmail() {
  console.log("📤 Attempting to send a test email with HTML template...");

  try {
    // Create a SendGrid SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.sendgrid.net
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // TLS (false for port 587)
      auth: {
        user: process.env.SMTP_USER, // "apikey"
        pass: process.env.SMTP_PASS, // SendGrid API key
      },
    });

    const alertData = {
      userName: 'Rajeev',
      serviceName: 'My Awesome Website',
      serviceTarget: 'https://example.com',
      status: 'Down',
      timestamp: new Date().toUTCString(),
      responseTime: '5000ms',
      error: 'Connection timed out after 5000ms',
    };

    const subject = `PulseMonitor Alert: ${alertData.serviceName} is ${alertData.status}`;
    const htmlBody = populateTemplate(alertTemplate, alertData);

    // Compose email
    const mailOptions = {
      from: `"PulseMonitor" <${process.env.FROM_EMAIL}>`,
      to: "elonerajeev@gmail.com",
      subject: subject,
      html: htmlBody,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ HTML Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send HTML email:");
    console.error(error);
  }
}

// Run the test
sendTestEmail();
