/**
 * Redis Service
 * Centralized Redis client with connection pooling, error handling, and monitoring
 * Used for: token blacklist, sessions, caching, rate limiting, job queues
 */

import redis from 'redis';
import { getLoggerService } from './loggerService.js';

const logger = getLoggerService();

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 * @returns {Promise<redis.RedisClient>} Connected Redis client
 */
export const initializeRedis = async () => {
  if (redisClient && isConnected) {
    logger.info('Redis already initialized');
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 
      `redis://:${process.env.REDIS_PASSWORD || ''}@${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 retries');
            return new Error('Redis max retries reached');
          }
          return retries * 100; // Exponential backoff
        },
        connectTimeout: 10000,
      },
      // Retry strategy for operations
      retry_strategy: (options) => {
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      },
    });

    // Error handling
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', {
        message: err.message,
        code: err.code,
      });
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('✓ Redis connected');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    redisClient.on('ready', () => {
      logger.info('✓ Redis ready');
    });

    // Connect to Redis
    await redisClient.connect();
    isConnected = true;

    logger.info('✓ Redis initialized successfully');
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Get Redis client instance
 * @returns {redis.RedisClient} Redis client
 */
export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
};

/**
 * Check if Redis is connected
 * @returns {boolean} True if connected
 */
export const isRedisConnected = () => {
  return isConnected && redisClient?.isOpen;
};

/**
 * Set a key with optional expiration
 * @param {string} key
 * @param {*} value
 * @param {number} ttlSeconds - Time to live in seconds (optional)
 */
export const redisSet = async (key, value, ttlSeconds = null) => {
  try {
    const client = getRedisClient();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }

    logger.debug('Redis SET', { key, ttlSeconds });
    return true;
  } catch (error) {
    logger.error('Redis SET failed', { key, error: error.message });
    throw error;
  }
};

/**
 * Get a key value
 * @param {string} key
 * @returns {Promise<*>} Value or null if not found
 */
export const redisGet = async (key) => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);

    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return value; // Return as string if not JSON
      }
    }

    return null;
  } catch (error) {
    logger.error('Redis GET failed', { key, error: error.message });
    throw error;
  }
};

/**
 * Delete a key
 * @param {string} key
 */
export const redisDel = async (key) => {
  try {
    const client = getRedisClient();
    const result = await client.del(key);

    logger.debug('Redis DEL', { key, deleted: result > 0 });
    return result > 0;
  } catch (error) {
    logger.error('Redis DEL failed', { key, error: error.message });
    throw error;
  }
};

/**
 * Delete multiple keys
 * @param {string[]} keys
 */
export const redisDelMultiple = async (keys) => {
  try {
    const client = getRedisClient();
    const result = await client.del(keys);

    logger.debug('Redis DEL multiple', { count: keys.length, deleted: result });
    return result;
  } catch (error) {
    logger.error('Redis DEL multiple failed', { count: keys.length, error: error.message });
    throw error;
  }
};

/**
 * Check if key exists
 * @param {string} key
 */
export const redisExists = async (key) => {
  try {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Redis EXISTS failed', { key, error: error.message });
    throw error;
  }
};

/**
 * Increment a counter
 * @param {string} key
 * @param {number} increment - Amount to increment (default: 1)
 */
export const redisIncr = async (key, increment = 1) => {
  try {
    const client = getRedisClient();
    const result = await client.incrBy(key, increment);

    logger.debug('Redis INCR', { key, result });
    return result;
  } catch (error) {
    logger.error('Redis INCR failed', { key, error: error.message });
    throw error;
  }
};

/**
 * Get remaining TTL of a key
 * @param {string} key
 * @returns {number} TTL in seconds, -1 if no expiry, -2 if not exists
 */
export const redisTTL = async (key) => {
  try {
    const client = getRedisClient();
    const ttl = await client.ttl(key);
    return ttl;
  } catch (error) {
    logger.error('Redis TTL failed', { key, error: error.message });
    throw error;
  }
};

/**
 * Set expiration on existing key
 * @param {string} key
 * @param {number} ttlSeconds
 */
export const redisExpire = async (key, ttlSeconds) => {
  try {
    const client = getRedisClient();
    const result = await client.expire(key, ttlSeconds);

    logger.debug('Redis EXPIRE', { key, ttlSeconds });
    return result === 1;
  } catch (error) {
    logger.error('Redis EXPIRE failed', { key, error: error.message });
    throw error;
  }
};

/**
 * Flush all keys (use with caution)
 */
export const redisFlushAll = async () => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('SECURITY: Attempted to flush Redis in production!');
    throw new Error('Cannot flush Redis in production');
  }

  try {
    const client = getRedisClient();
    await client.flushAll();

    logger.warn('Redis flushed (dev environment only)');
    return true;
  } catch (error) {
    logger.error('Redis FLUSH failed', { error: error.message });
    throw error;
  }
};

/**
 * Get Redis info/stats
 */
export const getRedisInfo = async () => {
  try {
    const client = getRedisClient();
    const info = await client.info();

    // Parse info string into object
    const stats = {};
    const lines = info.split('\r\n');
    lines.forEach((line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key.trim()] = value.trim();
      }
    });

    return {
      connected: isConnected,
      stats: {
        memoryUsage: stats.used_memory_human,
        connectedClients: stats.connected_clients,
        commandsProcessed: stats.total_commands_processed,
        uptime: stats.uptime_in_seconds,
      },
    };
  } catch (error) {
    logger.error('Redis INFO failed', { error: error.message });
    return {
      connected: isConnected,
      error: error.message,
    };
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.disconnect();
      isConnected = false;
      logger.info('✓ Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection', { error: error.message });
    }
  }
};

/**
 * Health check for Redis
 * @returns {Promise<boolean>} True if healthy
 */
export const redisHealthCheck = async () => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const client = getRedisClient();
    const pong = await client.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    return false;
  }
};

export default {
  initializeRedis,
  getRedisClient,
  isRedisConnected,
  redisSet,
  redisGet,
  redisDel,
  redisDelMultiple,
  redisExists,
  redisIncr,
  redisTTL,
  redisExpire,
  redisFlushAll,
  getRedisInfo,
  closeRedis,
  redisHealthCheck,
};
