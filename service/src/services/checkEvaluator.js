/**
 * Turns a raw probe result into a verdict.
 *
 * Reachability is not health. A 500, a maintenance page, or a defaced homepage
 * all answer the request perfectly well, so the check only counts as passing
 * once the status code and the configured body assertions both hold.
 */

const DEFAULT_MAX_OK_STATUS = 400;

const contains = (haystack, needle, caseSensitive) => {
    if (caseSensitive) return haystack.includes(needle);
    return haystack.toLowerCase().includes(needle.toLowerCase());
};

/**
 * Checks the response's status code against the monitor's expectation.
 * Returns null when it passes, or an error descriptor when it does not.
 */
const checkStatusCode = (result, assertions) => {
    const expected = assertions?.expectedStatusCode;

    if (expected != null) {
        if (result.statusCode !== expected) {
            return {
                code: 'UNEXPECTED_STATUS',
                message: `Expected HTTP ${expected} but got ${result.statusCode}`,
            };
        }
        return null;
    }

    // With no explicit expectation, anything below 400 is a success. This is the
    // check that was missing entirely: every response, 500s included, used to be
    // recorded as "online".
    if (result.statusCode >= DEFAULT_MAX_OK_STATUS) {
        return {
            code: 'UNEXPECTED_STATUS',
            message: `Received HTTP ${result.statusCode}`,
        };
    }

    return null;
};

/**
 * Checks the response body against the monitor's content assertions.
 */
const checkBody = (result, assertions) => {
    const mustContain = assertions?.mustContain?.trim();
    const mustNotContain = assertions?.mustNotContain?.trim();
    if (!mustContain && !mustNotContain) return null;

    const body = result.body || '';
    const caseSensitive = Boolean(assertions?.caseSensitive);

    if (mustContain && !contains(body, mustContain, caseSensitive)) {
        // Say so when the body was cut short, otherwise a keyword that appears
        // past the buffer limit looks like a genuine content failure.
        const truncationNote = result.bodyTruncated
            ? ' (only the first part of the response was inspected)'
            : '';
        return {
            code: 'ASSERTION_FAILED',
            message: `Response does not contain "${mustContain}"${truncationNote}`,
        };
    }

    if (mustNotContain && contains(body, mustNotContain, caseSensitive)) {
        return {
            code: 'ASSERTION_FAILED',
            message: `Response contains forbidden text "${mustNotContain}"`,
        };
    }

    return null;
};

/**
 * Produces the log-shaped record to persist. The full response body is used for
 * matching and then dropped — only the stored excerpt is written.
 */
export const evaluateCheck = (raw, monitor) => {
    const { body, bodyTruncated, ...persistable } = raw;

    // A transport failure is already a verdict; there is nothing to assert on.
    if (raw.status !== 'online') {
        return persistable;
    }

    const assertions = monitor?.assertions || {};
    const failure = checkStatusCode(raw, assertions) || checkBody(raw, assertions);

    if (failure) {
        return {
            ...persistable,
            status: 'offline',
            error: failure,
        };
    }

    return persistable;
};

/** Human-readable summary of what a monitor asserts, for alerts and the UI. */
export const describeAssertions = (assertions) => {
    if (!assertions) return [];
    const parts = [];
    if (assertions.expectedStatusCode != null) {
        parts.push(`status is ${assertions.expectedStatusCode}`);
    }
    if (assertions.mustContain?.trim()) {
        parts.push(`body contains "${assertions.mustContain.trim()}"`);
    }
    if (assertions.mustNotContain?.trim()) {
        parts.push(`body excludes "${assertions.mustNotContain.trim()}"`);
    }
    return parts;
};
