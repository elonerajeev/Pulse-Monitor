import { Router } from 'express';
import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiKey from '../models/apiKey.model.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with JWT
router.use(verifyJWT);

/**
 * API Key Management Routes
 */

/**
 * Create a new API key
 * POST /api/v1/api-keys
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      permissions,
      expiresAt,
      ipWhitelist,
      allowedServices,
      rateLimit,
    } = req.body;

    if (!name) {
      throw new ApiError(400, 'API key name is required');
    }

    const { plainKey, keyHash, keyPrefix } = ApiKey.generateKey();

    const apiKey = await ApiKey.create({
      userId: req.user._id,
      name,
      description,
      keyHash,
      keyPrefix,
      permissions: permissions || ['monitoring:read', 'alerts:read'],
      expiresAt,
      ipWhitelist,
      allowedServices: allowedServices || [],
      rateLimit: rateLimit || {
        enabled: true,
        requestsPerMinute: 60,
        requestsPerHour: 1800,
        requestsPerDay: 50000,
      },
      createdBy: req.user._id,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          apiKey: apiKey.toObject(),
          plainKey, // Only shown once on creation
        },
        'API key created successfully. Store the plain key securely!'
      )
    );
  })
);

/**
 * Get all API keys for user
 * GET /api/v1/api-keys
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0, status = 'all' } = req.query;

    let query = { userId: req.user._id };
    if (status !== 'all') query.status = status;

    const apiKeys = await ApiKey.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await ApiKey.countDocuments(query);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          keys: apiKeys,
        },
        'API keys retrieved successfully'
      )
    );
  })
);

/**
 * Get API key by ID
 * GET /api/v1/api-keys/:keyId
 */
router.get(
  '/:keyId',
  asyncHandler(async (req, res) => {
    const { keyId } = req.params;

    const apiKey = await ApiKey.findById(keyId);

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    if (apiKey.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this API key');
    }

    return res.status(200).json(
      new ApiResponse(200, apiKey, 'API key retrieved successfully')
    );
  })
);

/**
 * Update API key
 * PUT /api/v1/api-keys/:keyId
 */
router.put(
  '/:keyId',
  asyncHandler(async (req, res) => {
    const { keyId } = req.params;
    const {
      name,
      description,
      permissions,
      rateLimit,
      ipWhitelist,
      allowedServices,
    } = req.body;

    const apiKey = await ApiKey.findById(keyId);

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    if (apiKey.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this API key');
    }

    if (name) apiKey.name = name;
    if (description) apiKey.description = description;
    if (permissions) apiKey.permissions = permissions;
    if (rateLimit) apiKey.rateLimit = { ...apiKey.rateLimit, ...rateLimit };
    if (ipWhitelist) apiKey.ipWhitelist = ipWhitelist;
    if (allowedServices) apiKey.allowedServices = allowedServices;

    await apiKey.save();

    return res.status(200).json(
      new ApiResponse(200, apiKey, 'API key updated successfully')
    );
  })
);

/**
 * Rotate API key
 * POST /api/v1/api-keys/:keyId/rotate
 */
router.post(
  '/:keyId/rotate',
  asyncHandler(async (req, res) => {
    const { keyId } = req.params;
    const { reason } = req.body;

    const apiKey = await ApiKey.findById(keyId);

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    if (apiKey.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this API key');
    }

    const plainKey = await apiKey.rotateKey(reason || 'Key rotation by user');

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          plainKey,
          message: 'Store the new key securely!',
        },
        'API key rotated successfully'
      )
    );
  })
);

/**
 * Revoke API key
 * POST /api/v1/api-keys/:keyId/revoke
 */
router.post(
  '/:keyId/revoke',
  asyncHandler(async (req, res) => {
    const { keyId } = req.params;
    const { reason } = req.body;

    const apiKey = await ApiKey.findById(keyId);

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    if (apiKey.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this API key');
    }

    await apiKey.revoke(reason || 'Revoked by user', req.user._id);

    return res.status(200).json(
      new ApiResponse(200, apiKey, 'API key revoked successfully')
    );
  })
);

/**
 * Get API key usage summary
 * GET /api/v1/api-keys/:keyId/usage
 */
router.get(
  '/:keyId/usage',
  asyncHandler(async (req, res) => {
    const { keyId } = req.params;

    const apiKey = await ApiKey.findById(keyId);

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    if (apiKey.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this API key');
    }

    const usage = apiKey.getUsageSummary();

    return res.status(200).json(
      new ApiResponse(200, usage, 'API key usage summary retrieved')
    );
  })
);

/**
 * Get API key usage history
 * GET /api/v1/api-keys/:keyId/usage/history
 */
router.get(
  '/:keyId/usage/history',
  asyncHandler(async (req, res) => {
    const { keyId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const apiKey = await ApiKey.findById(keyId);

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    if (apiKey.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this API key');
    }

    const history = apiKey.endpointUsage
      .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))
      .slice(offset, offset + parseInt(limit));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          history,
        },
        'API key usage history retrieved'
      )
    );
  })
);

/**
 * Delete API key
 * DELETE /api/v1/api-keys/:keyId
 */
router.delete(
  '/:keyId',
  asyncHandler(async (req, res) => {
    const { keyId } = req.params;

    const apiKey = await ApiKey.findById(keyId);

    if (!apiKey) {
      throw new ApiError(404, 'API key not found');
    }

    if (apiKey.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have access to this API key');
    }

    await ApiKey.findByIdAndDelete(keyId);

    return res.status(200).json(
      new ApiResponse(200, null, 'API key deleted successfully')
    );
  })
);

export default router;
