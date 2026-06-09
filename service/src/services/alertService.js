import axios from "axios";
import { sendEmail } from "./emailService.js";

export const sendAlert = async (monitoring, status, result, user) => {
    const { name, target, alertChannels } = monitoring;
    const timestamp = new Date().toUTCString();

    const alertData = {
        userName: user.name,
        serviceName: name,
        serviceTarget: target,
        status: status,
        timestamp: timestamp,
        responseTime: result.responseTime || '-',
        error: result.error || 'N/A',
        region: result.region || 'N/A'
    };

    // 1. Email Alert (Base)
    try {
        const subject = `PulseMonitor Alert: ${name} is ${status}`;
        await sendEmail(user.email, subject, 'alert', alertData);
    } catch (error) {
        console.error("Failed to send email alert:", error.message);
    }

    // 2. Slack Alert (Premium)
    if (alertChannels?.slack?.enabled && alertChannels?.slack?.webhookUrl) {
        try {
            await axios.post(alertChannels.slack.webhookUrl, {
                text: `🚨 *PulseMonitor Alert* 🚨\n*Service:* ${name}\n*Target:* ${target}\n*Status:* ${status}\n*Region:* ${result.region}\n*Time:* ${timestamp}`,
            });
        } catch (error) {
            console.error("Failed to send Slack alert:", error.message);
        }
    }

    // 3. Discord Alert (Premium)
    if (alertChannels?.discord?.enabled && alertChannels?.discord?.webhookUrl) {
        try {
            await axios.post(alertChannels.discord.webhookUrl, {
                content: `🚨 **PulseMonitor Alert** 🚨\n**Service:** ${name}\n**Target:** ${target}\n**Status:** ${status}\n**Region:** ${result.region}\n**Time:** ${timestamp}`,
            });
        } catch (error) {
            console.error("Failed to send Discord alert:", error.message);
        }
    }
};
