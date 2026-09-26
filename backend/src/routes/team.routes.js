import { Router } from 'express';
import * as teamController from '../controllers/team.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with JWT
router.use(verifyJWT);

/**
 * Team Management Routes
 */

// Create and list teams
router.post('/', teamController.createTeam);

router.get('/', teamController.getUserTeams);

// Get team by ID
router.get('/:teamId', teamController.getTeam);

// Update team
router.put('/:teamId', teamController.updateTeam);

// Team members
router.get('/:teamId/members', teamController.getTeamMembers);

// Member invitation
router.post('/:teamId/members/invite', teamController.inviteMember);

router.post('/:teamId/members/accept-invite', teamController.acceptInvitation);

// Update member role
router.patch('/:teamId/members/:memberId', teamController.updateMemberRole);

// Remove member
router.delete('/:teamId/members/:memberId', teamController.removeMember);

// Team audit log
router.get('/:teamId/audit-log', teamController.getAuditLog);

// Team billing
router.get('/:teamId/billing', teamController.getTeamBilling);

// Team shared services
router.get('/:teamId/services', teamController.getSharedServices);

// Delete team
router.delete('/:teamId', teamController.deleteTeam);

export default router;
