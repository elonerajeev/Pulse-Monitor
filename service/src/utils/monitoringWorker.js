
import axios from 'axios';
import https from 'https';
import { performance } from 'perf_hooks';

const getSslInfo = (url) => {
  return new Promise((resolve, reject) => {
    try {
      const hostname = new URL(url).hostname;
      const options = {
        hostname: hostname,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false, // Important for self-signed certs, but use with caution
      };

      const req = https.request(options, (res) => {
        const certificate = res.socket.getPeerCertificate();
        if (certificate && Object.keys(certificate).length > 0) {
          const daysUntilExpiry = (new Date(certificate.valid_to).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
          resolve({
            subject: certificate.subject.CN,
            issuer: certificate.issuer.CN,
            valid_from: new Date(certificate.valid_from),
            valid_to: new Date(certificate.valid_to),
            daysUntilExpiry: Math.ceil(daysUntilExpiry),
          });
        } else {
          resolve(null); // No SSL certificate found
        }
      });

      req.on('error', (e) => {
        // This can happen for various reasons, e.g., host not found, connection refused
        reject(new Error(`SSL check failed: ${e.message}`));
      });

      req.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const checkWebsite = async (monitoring) => {
  const result = {
    monitoringId: monitoring._id,
    status: 'pending',
    responseTime: null,
    ssl: null,
    error: null,
  };

  const startTime = performance.now();

  try {
    const response = await axios.get(monitoring.target, { timeout: 10000 });
    const endTime = performance.now();

    result.status = response.status >= 200 && response.status < 400 ? 'online' : 'offline';
    result.responseTime = Math.round(endTime - startTime);

    if (monitoring.target.startsWith('https://')) {
      try {
        result.ssl = await getSslInfo(monitoring.target);
      } catch (sslError) {
        console.warn(`Could not check SSL for ${monitoring.target}: ${sslError.message}`);
        // Decide if an SSL check failure should mark the site as down
        // For now, we'll just log the warning and continue
      }
    }
  } catch (error) {
    result.status = 'offline';
    if (error.response) {
      result.error = { message: `Status ${error.response.status} - ${error.response.statusText}`, code: error.response.status };
    } else if (error.code) {
      result.error = { message: error.message, code: error.code };
    } else {
      result.error = { message: error.message, code: 'UNKNOWN' };
    }
  }

  return result;
};
