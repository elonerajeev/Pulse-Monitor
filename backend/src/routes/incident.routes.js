import { Router } from 'express';
import * as incidentController from '../controllers/incident.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with JWT
router.use(verifyJWT);

/**
 * Incident Management Routes
 */

// Create and list incidents
router.post('/', incidentController.createIncident);

router.get('/', incidentController.listIncidents);

// Get incidents for a specific service
router.get('/service/:serviceId', incidentController.getServiceIncidents);

// Get incident statistics
router.get('/stats/overview', incidentController.getIncidentStats);

// Get incident by ID
router.get('/:incidentId', incidentController.getIncidentById);

// Update incident status
router.patch('/:incidentId/status', incidentController.updateIncidentStatus);

// Timeline management
router.post('/:incidentId/timeline', incidentController.addTimelineEvent);

router.get('/:incidentId/timeline', incidentController.getIncidentTimeline);

// RCA management
router.post('/:incidentId/rca', incidentController.addRCA);

router.get('/:incidentId/rca', incidentController.getRCA);

// Impact metrics
router.patch('/:incidentId/impact', incidentController.updateImpactMetrics);

// Customer communication
router.post('/:incidentId/communication', incidentController.publishCommunication);

router.get('/:incidentId/communications', incidentController.getIncidentCommunications);

// Delete incident
router.delete('/:incidentId', incidentController.deleteIncident);

export default router;
