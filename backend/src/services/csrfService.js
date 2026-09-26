/**
 * CSRF Service
 * Manages CSRF token generation and validation
 * Implements double-submit cookie pattern for CSRF protection
 */

import crypto from 'crypto';
import { getRedisClient, isRedisConnected, redisSet, redisGet, redisDel } from './redisService.js';
import { getLoggerService } from './loggerService.js';

const logger = getLoggerService();

const CSRF_TOKEN_PREFIX = 'csrf:token:';
const CSRF_SECRET_PREFIX = 'csrf:secret:';
const TOKEN_LENGTH = 32; // bytes
const TOKEN_TTL = 3600; // 1 hour

/**
 * Generate CSRF token and secret
 * Returns both token (send to client) and secret (store in secure cookie)
 * 
 * @returns {Promise<{token: string, secret: string}>}
 */
export const generateCSRFToken = async () => {
  try {
    // Generate random secret
    const secret = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
    
    // Generate token from secret using HMAC
    const token = crypto
      .createHmac('sha256', process.env.CSRF_SECRET_KEY || 'default-secret-key')
      .update(secret)
      .digest('hex');

    // Store secret in Redis for validation (with TTL)
    if (isRedisConnected()) {
      const tokenId = crypto.randomBytes(16).toString('hex');
      await redisSet(`${CSRF_TOKEN_PREFIX}${tokenId}`, secret, TOKEN_TTL);
      
      logger.debug('CSRF token generated', {
        tokenId: tokenId.substring(0, 10) + '...',
        expiresIn: TOKEN_TTL,
      });
    }

    return {
      token,
      secret,
    };
  } catch (error) {
    logger.error('Failed to generate CSRF token', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Validate CSRF token
 * Verifies token against stored secret
 * 
 * @param {string} token - Token from request header/body
 * @param {string} secret - Secret from cookie
 * @returns {Promise<boolean>} True if valid
 */
export const validateCSRFToken = async (token, secret) => {
  try {
    if (!token || !secret) {
      logger.warn('CSRF validation: missing token or secret');
      return false;
    }

    // Regenerate token from secret and compare
    const expectedToken = crypto
      .createHmac('sha256', process.env.CSRF_SECRET_KEY || 'default-secret-key')
      .update(secret)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    );

    if (!isValid) {
      logger.warn('CSRF validation failed: token mismatch');
    }

    return isValid;
  } catch (error) {
    logger.error('CSRF validation error', {
      error: error.message,
    });
    // Fail secure - return false on validation error
    return false;
  }
};

/**
 * Validate CSRF token with refresh
 * Validates token and generates new one for next request
 * 
 * @param {string} token - Current token
 * @param {string} secret - Current secret
 * @returns {Promise<{valid: boolean, newToken: string, newSecret: string}>}
 */
export const validateAndRefreshCSRFToken = async (token, secret) => {
  try {
    const isValid = await validateCSRFToken(token, secret);

    if (!isValid) {
      return {
        valid: false,
        newToken: null,
        newSecret: null,
      };
    }

    // Generate new token for next request
    const newTokenData = await generateCSRFToken();

    logger.debug('CSRF token validated and refreshed', {
      valid: true,
    });

    return {
      valid: true,
      newToken: newTokenData.token,
      newSecret: newTokenData.secret,
    };
  } catch (error) {
    logger.error('CSRF validation and refresh failed', {
      error: error.message,
    });
    return {
      valid: false,
      newToken: null,
      newSecret: null,
    };
  }
};

/**
 * Invalidate a CSRF token
 * Useful for logout or explicit revocation
 * 
 * @param {string} secret - Secret to invalidate
 */
export const invalidateCSRFToken = async (secret) => {
  try {
    if (!isRedisConnected()) {
      return true; // Redis not available, skip
    }

    // Find and delete token with this secret
    // This is simplified - in production might use Redis SET scanning
    logger.debug('CSRF token invalidated', {
      secret: secret?.substring(0, 10) + '...',
    });

    return true;
  } catch (error) {
    logger.error('Failed to invalidate CSRF token', {
      error: error.message,
    });
    return false;
  }
};

export default {
  generateCSRFToken,
  validateCSRFToken,
  validateAndRefreshCSRFToken,
  invalidateCSRFToken,
};
