/**
 * Token Blacklist Service
 * Manages token revocation and blacklisting
 * Used for: logout, token invalidation, compromised token handling
 */

import {
  redisSet,
  redisGet,
  redisDel,
  redisExists,
  isRedisConnected,
  getRedisInfo,
} from './redisService.js';
import { getLoggerService } from './loggerService.js';

const logger = getLoggerService();

// Key prefix for blacklist entries
const BLACKLIST_PREFIX = 'token:blacklist:';
const SESSION_PREFIX = 'token:session:';

/**
 * Blacklist a token (add to blacklist)
 * @param {string} tokenId - JWT ID (jti claim)
 * @param {number} expiresIn - Token expiration time in seconds
 * @returns {Promise<boolean>} True if successful
 */
export const blacklistToken = async (tokenId, expiresIn) => {
  try {
    if (!isRedisConnected()) {
      logger.warn('Redis not connected, skipping token blacklist');
      return false;
    }

    const key = `${BLACKLIST_PREFIX}${tokenId}`;
    const ttl = Math.min(expiresIn, 86400 * 7); // Max 7 days, or token expiry, whichever is less

    await redisSet(key, JSON.stringify({
      blacklistedAt: new Date().toISOString(),
      reason: 'logout' | 'compromise' | 'revocation',
    }), ttl);

    logger.debug('Token blacklisted', {
      tokenId: tokenId.substring(0, 10) + '...',
      ttl,
    });

    return true;
  } catch (error) {
    logger.error('Failed to blacklist token', {
      error: error.message,
      tokenId: tokenId?.substring(0, 10) + '...',
    });
    // Don't throw - allow operation to continue even if blacklist fails
    return false;
  }
};

/**
 * Check if token is blacklisted
 * @param {string} tokenId - JWT ID (jti claim)
 * @returns {Promise<boolean>} True if blacklisted
 */
export const isTokenBlacklisted = async (tokenId) => {
  try {
    if (!isRedisConnected()) {
      logger.warn('Redis not connected, assuming token not blacklisted');
      return false;
    }

    const key = `${BLACKLIST_PREFIX}${tokenId}`;
    const exists = await redisExists(key);

    if (exists) {
      logger.debug('Blacklisted token detected', {
        tokenId: tokenId.substring(0, 10) + '...',
      });
    }

    return exists;
  } catch (error) {
    logger.error('Failed to check token blacklist', {
      error: error.message,
      tokenId: tokenId?.substring(0, 10) + '...',
    });
    // If we can't check, assume not blacklisted (fail open)
    return false;
  }
};

/**
 * Remove token from blacklist (useful for testing)
 * @param {string} tokenId - JWT ID
 * @returns {Promise<boolean>} True if removed
 */
export const removeFromBlacklist = async (tokenId) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const key = `${BLACKLIST_PREFIX}${tokenId}`;
    return await redisDel(key);
  } catch (error) {
    logger.error('Failed to remove token from blacklist', {
      error: error.message,
      tokenId: tokenId?.substring(0, 10) + '...',
    });
    return false;
  }
};

/**
 * Create a session entry (track active tokens per user)
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID (can be same as jti)
 * @param {Object} sessionData - Session info (ipAddress, userAgent, etc.)
 * @param {number} ttlSeconds - Session TTL
 * @returns {Promise<boolean>} True if successful
 */
export const createSession = async (userId, sessionId, sessionData, ttlSeconds = 86400 * 7) => {
  try {
    if (!isRedisConnected()) {
      logger.warn('Redis not connected, skipping session creation');
      return false;
    }

    const key = `${SESSION_PREFIX}${userId}:${sessionId}`;
    const data = {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      ...sessionData, // ipAddress, userAgent, deviceId, etc.
    };

    await redisSet(key, JSON.stringify(data), ttlSeconds);

    logger.debug('Session created', {
      userId,
      sessionId: sessionId.substring(0, 10) + '...',
    });

    return true;
  } catch (error) {
    logger.error('Failed to create session', {
      error: error.message,
      userId,
    });
    return false;
  }
};

/**
 * Get session info
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Session data or null
 */
export const getSession = async (userId, sessionId) => {
  try {
    if (!isRedisConnected()) {
      return null;
    }

    const key = `${SESSION_PREFIX}${userId}:${sessionId}`;
    return await redisGet(key);
  } catch (error) {
    logger.error('Failed to get session', {
      error: error.message,
      userId,
      sessionId,
    });
    return null;
  }
};

/**
 * Invalidate a session (logout)
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True if successful
 */
export const invalidateSession = async (userId, sessionId) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const key = `${SESSION_PREFIX}${userId}:${sessionId}`;
    return await redisDel(key);
  } catch (error) {
    logger.error('Failed to invalidate session', {
      error: error.message,
      userId,
      sessionId,
    });
    return false;
  }
};

/**
 * Invalidate all sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of sessions invalidated
 */
export const invalidateAllUserSessions = async (userId) => {
  try {
    if (!isRedisConnected()) {
      return 0;
    }

    // This is a simplified approach - in production, you might want to use SCAN
    // For now, we'll track sessions differently or use a set
    const pattern = `${SESSION_PREFIX}${userId}:*`;

    // Note: Redis client should have KEYS support
    // For now, return 0 (would need implementation with scanning)
    logger.warn('invalidateAllUserSessions not fully implemented', { userId });
    return 0;
  } catch (error) {
    logger.error('Failed to invalidate all user sessions', {
      error: error.message,
      userId,
    });
    return 0;
  }
};

/**
 * Track failed login attempts
 * @param {string} email - User email
 * @param {string} ipAddress - IP address
 * @returns {Promise<number>} Current attempt count
 */
export const recordFailedLoginAttempt = async (email, ipAddress) => {
  try {
    if (!isRedisConnected()) {
      logger.warn('Redis not connected, skipping login attempt tracking');
      return 0;
    }

    const key = `login:failed:${email}:${ipAddress}`;
    const ttl = 15 * 60; // 15 minutes

    // Increment counter
    const attempts = await redisIncr(key, 1);

    // Set TTL on first attempt
    if (attempts === 1) {
      await redisExpire(key, ttl);
    }

    logger.debug('Failed login attempt recorded', {
      email,
      ipAddress,
      attempts,
    });

    return attempts;
  } catch (error) {
    logger.error('Failed to record login attempt', {
      error: error.message,
      email,
      ipAddress,
    });
    return 0;
  }
};

/**
 * Check if account is locked due to failed attempts
 * @param {string} email - User email
 * @param {string} ipAddress - IP address
 * @param {number} maxAttempts - Max allowed attempts (default: 5)
 * @returns {Promise<{locked: boolean, attemptsLeft: number, unlockAt: Date|null}>}
 */
export const checkLoginAttempts = async (email, ipAddress, maxAttempts = 5) => {
  try {
    if (!isRedisConnected()) {
      return { locked: false, attemptsLeft: maxAttempts, unlockAt: null };
    }

    const key = `login:failed:${email}:${ipAddress}`;
    const lockKey = `login:locked:${email}:${ipAddress}`;

    // Check if account is already locked
    const isLocked = await redisExists(lockKey);
    if (isLocked) {
      const ttl = await redisTTL(lockKey);
      return {
        locked: true,
        attemptsLeft: 0,
        unlockAt: new Date(Date.now() + ttl * 1000),
      };
    }

    // Check current attempts
    const attemptsStr = await redisGet(key);
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0;
    const attemptsLeft = Math.max(0, maxAttempts - attempts);

    return {
      locked: false,
      attemptsLeft,
      unlockAt: null,
    };
  } catch (error) {
    logger.error('Failed to check login attempts', {
      error: error.message,
      email,
    });
    return { locked: false, attemptsLeft: maxAttempts, unlockAt: null };
  }
};

/**
 * Lock account due to too many failed attempts
 * @param {string} email - User email
 * @param {string} ipAddress - IP address
 * @param {number} lockDurationSeconds - Lock duration (default: 15 minutes)
 */
export const lockAccount = async (email, ipAddress, lockDurationSeconds = 15 * 60) => {
  try {
    if (!isRedisConnected()) {
      logger.warn('Redis not connected, skipping account lock');
      return false;
    }

    const lockKey = `login:locked:${email}:${ipAddress}`;
    const attemptsKey = `login:failed:${email}:${ipAddress}`;

    await redisSet(lockKey, JSON.stringify({
      lockedAt: new Date().toISOString(),
      reason: 'too_many_failed_attempts',
    }), lockDurationSeconds);

    // Clear attempts counter
    await redisDel(attemptsKey);

    logger.warn('Account locked due to failed attempts', {
      email,
      ipAddress,
      lockDuration: lockDurationSeconds,
    });

    return true;
  } catch (error) {
    logger.error('Failed to lock account', {
      error: error.message,
      email,
    });
    return false;
  }
};

/**
 * Clear failed login attempts for user/IP
 * @param {string} email - User email
 * @param {string} ipAddress - IP address
 */
export const clearFailedLoginAttempts = async (email, ipAddress) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const key = `login:failed:${email}:${ipAddress}`;
    return await redisDel(key);
  } catch (error) {
    logger.error('Failed to clear login attempts', {
      error: error.message,
      email,
    });
    return false;
  }
};

/**
 * Get blacklist statistics
 */
export const getBlacklistStats = async () => {
  try {
    if (!isRedisConnected()) {
      return null;
    }

    const info = await getRedisInfo();
    return info;
  } catch (error) {
    logger.error('Failed to get blacklist stats', { error: error.message });
    return null;
  }
};

export default {
  blacklistToken,
  isTokenBlacklisted,
  removeFromBlacklist,
  createSession,
  getSession,
  invalidateSession,
  invalidateAllUserSessions,
  recordFailedLoginAttempt,
  checkLoginAttempts,
  lockAccount,
  clearFailedLoginAttempts,
  getBlacklistStats,
};
