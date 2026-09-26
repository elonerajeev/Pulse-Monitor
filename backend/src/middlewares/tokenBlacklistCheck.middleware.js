/**
 * Token Blacklist Check Middleware
 * Verifies that JWT tokens are not blacklisted
 * Runs after JWT verification in the auth flow
 */

import { isTokenBlacklisted } from '../services/tokenBlacklistService.js';
import { ApiError } from '../utils/ApiError.js';
import { getLoggerService } from '../services/loggerService.js';

const logger = getLoggerService();

/**
 * Middleware to check if token is blacklisted
 * Should be used after JWT verification middleware
 */
export const tokenBlacklistCheckMiddleware = async (req, res, next) => {
  try {
    // Get token ID from JWT payload (jti claim)
    const tokenId = req.user?.jti;
    const correlationId = req.correlationId || 'unknown';

    if (!tokenId) {
      logger.warn('No token ID (jti) in request', {
        correlationId,
        userId: req.user?.id,
      });
      // Continue without checking if no jti (might be from API key auth)
      return next();
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(tokenId);

    if (isBlacklisted) {
      logger.warn('Blacklisted token used', {
        correlationId,
        userId: req.user?.id,
        tokenId: tokenId.substring(0, 10) + '...',
      });

      return next(
        new ApiError(
          401,
          'Token has been invalidated. Please login again.',
          'AUTH_008'
        )
      );
    }

    // Token is valid, continue
    next();
  } catch (error) {
    logger.error('Token blacklist check failed', {
      error: error.message,
      correlationId: req.correlationId,
    });

    // On error, fail open (allow request) - don't block due to redis issues
    logger.warn('Allowing request despite token blacklist check error');
    next();
  }
};

export default tokenBlacklistCheckMiddleware;
