
import axios from 'axios';
import https from 'https';
import { performance } from 'perf_hooks';

const getSslInfo = (url) => {
  return new Promise((resolve, reject) => {
    const hostname = new URL(url).hostname;
    const options = {
      hostname: hostname,
      port: 443,
      method: 'GET',
      timing: true, // Enable timing events
    };

    const req = https.request(options, (res) => {
      const certificate = res.socket.getPeerCertificate();
      if (certificate && Object.keys(certificate).length > 0) {
        resolve({
          subject: certificate.subject,
          issuer: certificate.issuer,
          valid_from: certificate.valid_from,
          valid_to: certificate.valid_to,
        });
      } else {
        reject('No SSL certificate found.');
      }
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
};

const getDaysUntilExpiry = (validTo) => {
  const expiryDate = new Date(validTo);
  const currentDate = new Date();
  const timeDiff = expiryDate.getTime() - currentDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const monitorWebsite = async (url) => {
  try {
    console.log(`🔍 Monitoring ${url}...\n`);

    const timings = {
      start: performance.now(),
      dns: null,
      tcp: null,
      tls: null,
      firstByte: null,
      end: null,
    };

    const agent = new https.Agent({
      keepAlive: false,
    });

    const instance = axios.create({ httpsAgent: agent });

    instance.interceptors.request.use((config) => {
      config.headers['request-start-time'] = performance.now();
      return config;
    });

    instance.interceptors.response.use((response) => {
      const requestStartTime = response.config.headers['request-start-time'];
      timings.end = performance.now();
      timings.firstByte = timings.end - requestStartTime;
      return response;
    });

    const response = await instance.get(url, {
      responseType: 'text',
    });

    console.log('--- Website Status ---');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content Size: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`Response Time: ${(timings.end - timings.start).toFixed(2)} ms\n`);

    console.log('--- Response Headers ---');
    console.log(response.headers);
    console.log('\n');

    if (url.startsWith('https://')) {
      const sslInfo = await getSslInfo(url);
      const daysUntilExpiry = getDaysUntilExpiry(sslInfo.valid_to);
      console.log('--- SSL Certificate ---');
      console.log(`Subject: ${sslInfo.subject.CN}`);
      console.log(`Issuer: ${sslInfo.issuer.CN}`);
      console.log(`Valid From: ${sslInfo.valid_from}`);
      console.log(`Valid To: ${sslInfo.valid_to} (${daysUntilExpiry} days left)`);
      console.log('\n');
    }

    // Detailed timings from socket
    const socket = response.request.socket;
    if (socket && socket.getTimings) {
        const socketTimings = socket.getTimings();
        timings.dns = socketTimings.dnsLookupAt - socketTimings.startAt;
        timings.tcp = socketTimings.tcpConnectAt - socketTimings.dnsLookupAt;
        timings.tls = socketTimings.tlsHandshakeAt - socketTimings.tcpConnectAt;

        console.log('--- Connection Timings ---');
        console.log(`DNS Lookup: ${timings.dns.toFixed(2)} ms`);
        console.log(`TCP Connection: ${timings.tcp.toFixed(2)} ms`);
        console.log(`TLS Handshake: ${timings.tls.toFixed(2)} ms`);
        console.log(`Time to First Byte: ${timings.firstByte.toFixed(2)} ms`);
    }


  } catch (error) {
    console.error('--- Error ---');
    if (error.response) {
      console.log(`Status: ${error.response.status} ${error.response.statusText}`);
    } else {
      console.log(error.message);
    }
  }
};

const url = process.argv[2];

if (!url) {
  console.log('Please provide a URL to monitor.');
  console.log('Usage: node src/monitor.js <URL>');
} else {
  monitorWebsite(url);
}
