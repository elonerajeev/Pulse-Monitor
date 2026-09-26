import { Router } from 'express';
import * as alertRuleController from '../controllers/alertRule.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with JWT
router.use(verifyJWT);

/**
 * Alert Rule Routes
 */

// Create and list alert rules
router.post('/rules', alertRuleController.createAlertRule);

router.get('/rules', alertRuleController.listAlertRules);

// Alert rule statistics
router.get('/stats/overview', alertRuleController.getAlertRuleStats);

// Get alert rule by ID
router.get('/rules/:ruleId', alertRuleController.getAlertRule);

// Update alert rule
router.put('/rules/:ruleId', alertRuleController.updateAlertRule);

// Test alert rule
router.post('/rules/:ruleId/test', alertRuleController.testAlertRule);

// Get alert rule execution history
router.get('/rules/:ruleId/history', alertRuleController.getAlertRuleHistory);

// Get triggered alerts from a rule
router.get('/rules/:ruleId/alerts', alertRuleController.getTriggeredAlerts);

// Enable/disable alert rule
router.patch('/rules/:ruleId/enable', alertRuleController.enableAlertRule);

router.patch('/rules/:ruleId/disable', alertRuleController.disableAlertRule);

// Duplicate alert rule
router.post('/rules/:ruleId/duplicate', alertRuleController.duplicateAlertRule);

// Delete alert rule
router.delete('/rules/:ruleId', alertRuleController.deleteAlertRule);

export default router;
