import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';

const getDaysUntilExpiry = (validTo) => {
    const expiryDate = new Date(validTo);
    const currentDate = new Date();
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const getProtocol = (url) => {
    if (url.startsWith('https')) {
        return https;
    } else {
        return http;
    }
}

const addProtocol = (url) => {
    if (!url.startsWith('http') && !url.startsWith('https')) {
        return `https://${url}`
    }
    return url;
}

export const monitorWebsite = (url) => {
    return new Promise((resolve) => {
        url = addProtocol(url);
        const protocol = getProtocol(url);
        const timings = {
            start: performance.now(),
            dns: null,
            tcp: null,
            tls: null,
            firstByte: null,
            end: null,
            total: null,
        };
        let responseBody = '';

        const req = protocol.get(url, { timeout: 10000 }, (res) => {
            timings.firstByte = performance.now();

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                timings.end = performance.now();
                timings.total = timings.end - timings.start;
                
                let sslInfo = null;
                if (res.socket && res.socket.getPeerCertificate) {
                    const cert = res.socket.getPeerCertificate();
                    if (cert && Object.keys(cert).length > 0) {
                        sslInfo = {
                            subject: cert.subject,
                            issuer: cert.issuer,
                            validFrom: cert.valid_from,
                            validTo: cert.valid_to,
                            daysUntilExpiry: getDaysUntilExpiry(cert.valid_to),
                        };
                    }
                }
                
                resolve({
                    status: 'online',
                    statusCode: res.statusCode,
                    responseTime: timings.total,
                    timings: {
                        dns: timings.dns ? (timings.dns - timings.start) : 0,
                        tcp: timings.tcp ? (timings.tcp - (timings.dns || timings.start)) : 0,
                        tls: timings.tls ? (timings.tls - timings.tcp) : 0,
                        firstByte: timings.firstByte - (timings.tls || timings.tcp || timings.dns || timings.start),
                        contentTransfer: timings.end - timings.firstByte,
                        total: timings.total,
                    },
                    ssl: sslInfo,
                    responseBody: responseBody.substring(0, 200), // Store first 200 chars
                    requests: Math.floor(Math.random() * (1000 - 50 + 1)) + 50,
                });
            });
        });

        req.on('socket', (socket) => {
            socket.on('lookup', () => {
                timings.dns = performance.now();
            });
            socket.on('connect', () => {
                timings.tcp = performance.now();
            });
            socket.on('secureConnect', () => {
                timings.tls = performance.now();
            });
        });

        req.on('error', (err) => {
            timings.end = performance.now();
            resolve({
                status: 'offline',
                responseTime: timings.end - timings.start,
                error: { message: err.message, code: err.code },
                requests: 0,
            });
        });

        req.on('timeout', () => {
            req.destroy();
            timings.end = performance.now();
            resolve({
                status: 'offline',
                responseTime: timings.end - timings.start,
                error: { message: 'Request timed out' },
                requests: 0,
            });
        });

        req.end();
    });
};
