import { Router } from 'express';
import * as multiRegionController from '../controllers/multiRegionMonitoring.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with JWT
router.use(verifyJWT);

/**
 * Multi-Region Monitoring Routes
 */

// Create and get multi-region config
router.post(
  '/:serviceId/multi-region',
  multiRegionController.createMultiRegionConfig
);

router.get('/:serviceId/multi-region', multiRegionController.getMultiRegionConfig);

// Regional health and performance
router.get(
  '/:serviceId/multi-region/health',
  multiRegionController.getRegionalHealth
);

router.get(
  '/:serviceId/multi-region/performance',
  multiRegionController.getRegionalPerformance
);

// Regional alerts
router.get(
  '/:serviceId/multi-region/alerts',
  multiRegionController.getRegionalAlerts
);

// Region configuration
router.put(
  '/:serviceId/multi-region/regions/:regionName',
  multiRegionController.updateRegionConfig
);

// Failover management
router.put(
  '/:serviceId/multi-region/failover',
  multiRegionController.configureFailover
);

router.post(
  '/:serviceId/multi-region/failover/trigger',
  multiRegionController.triggerFailover
);

router.get(
  '/:serviceId/multi-region/failover/history',
  multiRegionController.getFailoverHistory
);

// Delete multi-region config
router.delete(
  '/:serviceId/multi-region',
  multiRegionController.deleteMultiRegionConfig
);

export default router;
