import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_REDIRECTS = 5;
// Cap what we buffer. Without a ceiling a single large response can exhaust the
// worker's memory, and assertions never need more than the first chunk anyway.
const DEFAULT_MAX_BODY_BYTES = 256 * 1024;
// What gets persisted with the log. The rest is used for assertions and dropped.
const STORED_BODY_CHARS = 500;

const getDaysUntilExpiry = (validTo) => {
    const expiryDate = new Date(validTo);
    if (Number.isNaN(expiryDate.getTime())) return null;
    const timeDiff = expiryDate.getTime() - Date.now();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const getProtocol = (url) => (url.startsWith('https') ? https : http);

const addProtocol = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
};

/**
 * Certificate issuers and subjects arrive as objects of DN parts. `CN` is the
 * only piece worth showing, so flatten to it and fall back to the organisation.
 */
const describeCertParty = (party) => {
    if (!party || typeof party !== 'object') return null;
    return party.CN || party.O || null;
};

/**
 * Performs a single HTTP(S) request without following redirects.
 * Resolves with either a response descriptor or a transport-level failure.
 */
const requestOnce = (url, { timeoutMs, maxBodyBytes, startedAt }) =>
    new Promise((resolve) => {
        let settled = false;
        const done = (value) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };

        let protocol;
        try {
            protocol = getProtocol(url);
        } catch {
            return done({ ok: false, error: { message: 'Invalid URL', code: 'ERR_INVALID_URL' } });
        }

        const marks = { dns: null, tcp: null, tls: null, firstByte: null };
        const chunks = [];
        let bytes = 0;
        let truncated = false;

        const req = protocol.get(url, { timeout: timeoutMs }, (res) => {
            marks.firstByte = performance.now();

            res.on('data', (chunk) => {
                if (bytes >= maxBodyBytes) {
                    truncated = true;
                    return;
                }
                const remaining = maxBodyBytes - bytes;
                const slice = chunk.length > remaining ? chunk.subarray(0, remaining) : chunk;
                chunks.push(slice);
                bytes += slice.length;
                if (chunk.length > remaining) truncated = true;
            });

            res.on('end', () => {
                const end = performance.now();

                let sslInfo = null;
                if (typeof res.socket?.getPeerCertificate === 'function') {
                    const cert = res.socket.getPeerCertificate();
                    if (cert && Object.keys(cert).length > 0 && cert.valid_to) {
                        sslInfo = {
                            subject: cert.subject,
                            issuer: cert.issuer,
                            issuerName: describeCertParty(cert.issuer),
                            validFrom: cert.valid_from,
                            validTo: cert.valid_to,
                            daysUntilExpiry: getDaysUntilExpiry(cert.valid_to),
                        };
                    }
                }

                done({
                    ok: true,
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: Buffer.concat(chunks).toString('utf8'),
                    bodyTruncated: truncated,
                    ssl: sslInfo,
                    timings: {
                        dns: marks.dns ? marks.dns - startedAt : 0,
                        tcp: marks.tcp ? marks.tcp - (marks.dns || startedAt) : 0,
                        tls: marks.tls && marks.tcp ? marks.tls - marks.tcp : 0,
                        firstByte:
                            marks.firstByte - (marks.tls || marks.tcp || marks.dns || startedAt),
                        contentTransfer: end - marks.firstByte,
                    },
                });
            });

            res.on('error', (err) => {
                done({ ok: false, error: { message: err.message, code: err.code } });
            });
        });

        req.on('socket', (socket) => {
            socket.on('lookup', () => { marks.dns = performance.now(); });
            socket.on('connect', () => { marks.tcp = performance.now(); });
            socket.on('secureConnect', () => { marks.tls = performance.now(); });
        });

        req.on('error', (err) => {
            done({ ok: false, error: { message: err.message, code: err.code } });
        });

        req.on('timeout', () => {
            req.destroy();
            done({
                ok: false,
                error: { message: `Request timed out after ${timeoutMs}ms`, code: 'ETIMEDOUT' },
            });
        });

        req.end();
    });

/**
 * Probes a target and reports what came back.
 *
 * This reports transport reality only — whether a response arrived, what code it
 * carried, and how long it took. Deciding whether that response counts as
 * healthy is the caller's job (see evaluateCheck), because that verdict depends
 * on the monitor's configured assertions.
 */
export const monitorWebsite = async (url, options = {}) => {
    const {
        timeoutMs = DEFAULT_TIMEOUT_MS,
        maxRedirects = DEFAULT_MAX_REDIRECTS,
        maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
    } = options;

    const startedAt = performance.now();
    let currentUrl = addProtocol(String(url || '').trim());
    let redirectCount = 0;
    // A redirect chain that revisits a URL will never terminate; tracking what we
    // have already fetched turns an infinite loop into a reported failure.
    const visited = new Set();
    // The certificate seen on the first hop is the one for the target the user
    // configured, so keep it even if a redirect lands somewhere else.
    let firstSsl = null;

    while (true) {
        if (visited.has(currentUrl)) {
            return {
                status: 'offline',
                responseTime: performance.now() - startedAt,
                error: { message: `Redirect loop at ${currentUrl}`, code: 'ERR_REDIRECT_LOOP' },
                ssl: firstSsl,
                finalUrl: currentUrl,
                redirectCount,
                requests: 0,
            };
        }
        visited.add(currentUrl);

        const attempt = await requestOnce(currentUrl, { timeoutMs, maxBodyBytes, startedAt });
        const total = performance.now() - startedAt;

        if (!attempt.ok) {
            return {
                status: 'offline',
                responseTime: total,
                error: attempt.error,
                ssl: firstSsl,
                finalUrl: currentUrl,
                redirectCount,
                requests: 0,
            };
        }

        if (!firstSsl && attempt.ssl) firstSsl = attempt.ssl;

        const isRedirect =
            attempt.statusCode >= 300 &&
            attempt.statusCode < 400 &&
            attempt.headers?.location;

        if (isRedirect && redirectCount < maxRedirects) {
            redirectCount += 1;
            // Location may be relative; resolve it against the URL we just fetched.
            currentUrl = new URL(attempt.headers.location, currentUrl).toString();
            continue;
        }

        return {
            // "Reachable" — evaluateCheck decides whether it is actually healthy.
            status: 'online',
            statusCode: attempt.statusCode,
            responseTime: total,
            timings: { ...attempt.timings, total },
            ssl: firstSsl,
            // Full captured body for assertion matching. Not persisted.
            body: attempt.body,
            bodyTruncated: attempt.bodyTruncated,
            responseBody: attempt.body.substring(0, STORED_BODY_CHARS),
            finalUrl: currentUrl,
            redirectCount,
            requests: 0,
        };
    }
};
