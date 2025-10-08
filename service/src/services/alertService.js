
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { alertTemplate } from '../templates/alertTemplate.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const populateTemplate = (template, data) => {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    return data[key.trim()] || '';
  });
};

export const sendEmail = async (to, alertData) => {
  try {
    const subject = `Website Alert: ${alertData.serviceName} is ${alertData.status}`;
    const htmlBody = populateTemplate(alertTemplate, alertData);

    const info = await transporter.sendMail({
      from: `"PulseMonitor" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: htmlBody,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};
