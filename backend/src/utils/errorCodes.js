/**
 * Global Error Code Registry
 * Used for standardized error responses across the application
 * Enables client-side error handling and localization
 */

export const ERROR_CODES = {
  // Authentication Errors (AUTH_xxx)
  AUTH_001: { code: 'AUTH_001', message: 'Invalid credentials', statusCode: 401 },
  AUTH_002: { code: 'AUTH_002', message: 'User not found', statusCode: 404 },
  AUTH_003: { code: 'AUTH_003', message: 'Email already registered', statusCode: 409 },
  AUTH_004: { code: 'AUTH_004', message: 'Invalid or expired token', statusCode: 401 },
  AUTH_005: { code: 'AUTH_005', message: 'Password too weak', statusCode: 400 },
  AUTH_006: { code: 'AUTH_006', message: 'Account locked due to failed login attempts', statusCode: 429 },
  AUTH_007: { code: 'AUTH_007', message: 'Invalid CSRF token', statusCode: 403 },
  AUTH_008: { code: 'AUTH_008', message: 'Token blacklisted', statusCode: 401 },
  AUTH_009: { code: 'AUTH_009', message: 'Two-factor authentication required', statusCode: 403 },
  AUTH_010: { code: 'AUTH_010', message: 'Invalid 2FA code', statusCode: 401 },

  // Monitoring Errors (MON_xxx)
  MON_001: { code: 'MON_001', message: 'Service not found', statusCode: 404 },
  MON_002: { code: 'MON_002', message: 'Invalid service URL', statusCode: 400 },
  MON_003: { code: 'MON_003', message: 'Service limit reached for your plan', statusCode: 403 },
  MON_004: { code: 'MON_004', message: 'Invalid monitoring interval', statusCode: 400 },
  MON_005: { code: 'MON_005', message: 'Circular dependency detected', statusCode: 400 },
  MON_006: { code: 'MON_006', message: 'Webhook delivery failed', statusCode: 400 },
  MON_007: { code: 'MON_007', message: 'Alert channel not available for your plan', statusCode: 403 },

  // Subscription/Billing Errors (SUB_xxx)
  SUB_001: { code: 'SUB_001', message: 'Subscription not found', statusCode: 404 },
  SUB_002: { code: 'SUB_002', message: 'Payment failed', statusCode: 402 },
  SUB_003: { code: 'SUB_003', message: 'Invalid subscription status', statusCode: 400 },
  SUB_004: { code: 'SUB_004', message: 'Feature not available in current plan', statusCode: 403 },
  SUB_005: { code: 'SUB_005', message: 'Billing cycle issue', statusCode: 400 },

  // User Errors (USER_xxx)
  USER_001: { code: 'USER_001', message: 'Insufficient permissions', statusCode: 403 },
  USER_002: { code: 'USER_002', message: 'User not found', statusCode: 404 },
  USER_003: { code: 'USER_003', message: 'Email update failed', statusCode: 400 },
  USER_004: { code: 'USER_004', message: 'Password change failed', statusCode: 400 },

  // Validation Errors (VAL_xxx)
  VAL_001: { code: 'VAL_001', message: 'Missing required fields', statusCode: 400 },
  VAL_002: { code: 'VAL_002', message: 'Invalid data format', statusCode: 400 },
  VAL_003: { code: 'VAL_003', message: 'Invalid email format', statusCode: 400 },
  VAL_004: { code: 'VAL_004', message: 'Password mismatch', statusCode: 400 },

  // Database Errors (DB_xxx)
  DB_001: { code: 'DB_001', message: 'Database connection failed', statusCode: 500 },
  DB_002: { code: 'DB_002', message: 'Database query failed', statusCode: 500 },
  DB_003: { code: 'DB_003', message: 'Transaction failed', statusCode: 500 },
  DB_004: { code: 'DB_004', message: 'Duplicate key error', statusCode: 409 },

  // Rate Limiting Errors (RATE_xxx)
  RATE_001: { code: 'RATE_001', message: 'Too many requests', statusCode: 429 },
  RATE_002: { code: 'RATE_002', message: 'Too many login attempts', statusCode: 429 },

  // External Service Errors (EXT_xxx)
  EXT_001: { code: 'EXT_001', message: 'Stripe API error', statusCode: 502 },
  EXT_002: { code: 'EXT_002', message: 'Email service error', statusCode: 503 },
  EXT_003: { code: 'EXT_003', message: 'Slack/Discord webhook failed', statusCode: 502 },
  EXT_004: { code: 'EXT_004', message: 'Redis connection failed', statusCode: 503 },

  // Server Errors (SRV_xxx)
  SRV_001: { code: 'SRV_001', message: 'Internal server error', statusCode: 500 },
  SRV_002: { code: 'SRV_002', message: 'Service temporarily unavailable', statusCode: 503 },
  SRV_003: { code: 'SRV_003', message: 'Not implemented', statusCode: 501 },

  // WebSocket Errors (WS_xxx)
  WS_001: { code: 'WS_001', message: 'WebSocket connection failed', statusCode: 400 },
  WS_002: { code: 'WS_002', message: 'WebSocket authentication failed', statusCode: 401 },
};

/**
 * Get error code details
 * @param {string} code - Error code (e.g., 'AUTH_001')
 * @returns {Object} Error code details
 */
export function getErrorCode(code) {
  return ERROR_CODES[code] || ERROR_CODES.SRV_001;
}

/**
 * Map HTTP status code to common error code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error code
 */
export function getErrorCodeFromStatus(statusCode) {
  switch (statusCode) {
    case 400:
      return 'VAL_002';
    case 401:
      return 'AUTH_004';
    case 403:
      return 'USER_001';
    case 404:
      return 'MON_001';
    case 409:
      return 'DB_004';
    case 429:
      return 'RATE_001';
    case 500:
    default:
      return 'SRV_001';
  }
}
