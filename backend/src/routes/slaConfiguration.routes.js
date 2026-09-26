import { Router } from 'express';
import * as slaController from '../controllers/slaConfiguration.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with JWT
router.use(verifyJWT);

/**
 * SLA Configuration Routes
 */

// Create and get SLA config
router.post('/:serviceId/sla', slaController.createSLAConfiguration);

router.get('/:serviceId/sla', slaController.getSLAConfiguration);

// SLA metrics and performance
router.get('/:serviceId/sla/metrics', slaController.getSLAMetrics);

router.get('/:serviceId/sla/history', slaController.getSLAHistory);

// Update SLA targets and credits
router.put('/:serviceId/sla/targets', slaController.updateSLATargets);

router.put('/:serviceId/sla/credits', slaController.configureSLACredits);

// SLA breaches
router.post('/:serviceId/sla/breaches', slaController.recordSLABreach);

// SLA reporting
router.get('/:serviceId/sla/report', slaController.getSLAReport);

// SLA notifications
router.get('/:serviceId/sla/notifications', slaController.getSLANotifications);

router.put('/:serviceId/sla/notifications', slaController.updateSLANotifications);

// Delete SLA config
router.delete('/:serviceId/sla', slaController.deleteSLAConfiguration);

export default router;
