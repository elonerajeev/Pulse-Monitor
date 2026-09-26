import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';

/**
 * Team Management Controller
 * Handles team creation, member management, RBAC, invitations, and shared resources
 */

/**
 * Create a new team
 * POST /api/v1/teams
 */
const createTeam = asyncHandler(async (req, res) => {
  const { name, description, plan } = req.body;

  // Check if team name already exists for user
  const existingTeam = await Team.findOne({ name, 'members.user': req.user._id });
  if (existingTeam) {
    throw new ApiError(400, 'Team with this name already exists');
  }

  const team = await Team.create({
    name,
    description,
    plan: plan || 'starter',
    owner: req.user._id,
    members: [
      {
        user: req.user._id,
        role: 'owner',
        joinedAt: new Date(),
      },
    ],
    billing: {
      plan: plan || 'starter',
      seats: plan === 'enterprise' ? 999 : plan === 'professional' ? 50 : 5,
      usedSeats: 1,
      billingEmail: req.user.email,
    },
  });

  await team.populate(['owner', 'members.user']);

  return res
    .status(201)
    .json(new ApiResponse(201, team, 'Team created successfully'));
});

/**
 * Get team by ID
 * GET /api/v1/teams/:teamId
 */
const getTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId).populate(['owner', 'members.user']);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user has access
  const memberAccess = team.members.find(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!memberAccess && team.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, team, 'Team retrieved successfully'));
});

/**
 * Get all teams for user
 * GET /api/v1/teams
 */
const getUserTeams = asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const teams = await Team.find({
    $or: [
      { owner: req.user._id },
      { 'members.user': req.user._id },
    ],
  })
    .populate(['owner', 'members.user'])
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Team.countDocuments({
    $or: [
      { owner: req.user._id },
      { 'members.user': req.user._id },
    ],
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        teams,
      },
      'Teams retrieved successfully'
    )
  );
});

/**
 * Update team information
 * PUT /api/v1/teams/:teamId
 */
const updateTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { name, description } = req.body;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user is owner
  if (team.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team owner can update team settings');
  }

  if (name) team.name = name;
  if (description) team.description = description;

  await team.save();

  return res
    .status(200)
    .json(new ApiResponse(200, team, 'Team updated successfully'));
});

/**
 * Invite member to team
 * POST /api/v1/teams/:teamId/members/invite
 */
const inviteMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { email, role } = req.body;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user is owner or admin
  const requesterRole = team.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  )?.role;

  if (!['owner', 'admin'].includes(requesterRole)) {
    throw new ApiError(403, 'Only owners and admins can invite members');
  }

  // Check if user already a member
  const existingMember = team.members.find((m) => m.email === email);
  if (existingMember) {
    throw new ApiError(400, 'User is already a team member');
  }

  // Check if invitation already exists
  const existingInvite = team.invitations.find((i) => i.email === email);
  if (existingInvite) {
    throw new ApiError(400, 'Invitation already sent to this email');
  }

  const validRoles = ['member', 'admin'];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${validRoles.join(', ')}`);
  }

  // Create invitation
  const invitationToken = require('crypto').randomBytes(32).toString('hex');

  team.invitations.push({
    email,
    role,
    token: invitationToken,
    invitedAt: new Date(),
    invitedBy: req.user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  await team.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        email,
        role,
        invitationToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      'Invitation sent successfully'
    )
  );
});

/**
 * Accept team invitation
 * POST /api/v1/teams/:teamId/members/accept-invite
 */
const acceptInvitation = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { token } = req.body;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  const invitationIndex = team.invitations.findIndex((i) => i.token === token);

  if (invitationIndex === -1) {
    throw new ApiError(404, 'Invitation not found');
  }

  const invitation = team.invitations[invitationIndex];

  // Check if invitation is expired
  if (new Date() > invitation.expiresAt) {
    team.invitations.splice(invitationIndex, 1);
    await team.save();
    throw new ApiError(400, 'Invitation has expired');
  }

  // Check if email matches
  if (invitation.email !== req.user.email) {
    throw new ApiError(403, 'This invitation was sent to a different email');
  }

  // Add member
  team.members.push({
    user: req.user._id,
    role: invitation.role,
    joinedAt: new Date(),
  });

  // Remove invitation
  team.invitations.splice(invitationIndex, 1);

  // Update billing
  team.billing.usedSeats = team.members.length;

  // Add to audit log
  team.auditLog.push({
    action: 'member_joined',
    performedBy: req.user._id,
    targetUser: req.user._id,
    details: `User ${req.user.email} accepted team invitation`,
    timestamp: new Date(),
  });

  await team.save();
  await team.populate(['owner', 'members.user']);

  return res
    .status(200)
    .json(new ApiResponse(200, team, 'Invitation accepted successfully'));
});

/**
 * Get team members
 * GET /api/v1/teams/:teamId/members
 */
const getTeamMembers = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const team = await Team.findById(teamId).populate('members.user');

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  const members = team.members.slice(offset, offset + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: team.members.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        members,
      },
      'Team members retrieved successfully'
    )
  );
});

/**
 * Update member role
 * PATCH /api/v1/teams/:teamId/members/:memberId
 */
const updateMemberRole = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params;
  const { role } = req.body;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if requester is owner
  if (team.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team owner can change member roles');
  }

  const validRoles = ['member', 'admin'];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${validRoles.join(', ')}`);
  }

  const member = team.members.find((m) => m._id.toString() === memberId);

  if (!member) {
    throw new ApiError(404, 'Member not found');
  }

  const oldRole = member.role;
  member.role = role;

  // Add to audit log
  team.auditLog.push({
    action: 'member_role_changed',
    performedBy: req.user._id,
    targetUser: member.user,
    details: `Role changed from ${oldRole} to ${role}`,
    timestamp: new Date(),
  });

  await team.save();

  return res
    .status(200)
    .json(new ApiResponse(200, member, 'Member role updated successfully'));
});

/**
 * Remove member from team
 * DELETE /api/v1/teams/:teamId/members/:memberId
 */
const removeMember = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if requester is owner or admin
  const requesterRole = team.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  )?.role;

  if (!['owner', 'admin'].includes(requesterRole)) {
    throw new ApiError(403, 'Only owners and admins can remove members');
  }

  const member = team.members.find((m) => m._id.toString() === memberId);

  if (!member) {
    throw new ApiError(404, 'Member not found');
  }

  // Cannot remove owner
  if (member.role === 'owner') {
    throw new ApiError(400, 'Cannot remove team owner');
  }

  // Add to audit log
  team.auditLog.push({
    action: 'member_removed',
    performedBy: req.user._id,
    targetUser: member.user,
    details: `Member removed from team`,
    timestamp: new Date(),
  });

  // Remove member
  team.members = team.members.filter((m) => m._id.toString() !== memberId);
  team.billing.usedSeats = team.members.length;

  await team.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Member removed successfully'));
});

/**
 * Get team audit log
 * GET /api/v1/teams/:teamId/audit-log
 */
const getAuditLog = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user has access
  const hasAccess = team.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  ) || team.owner.toString() === req.user._id.toString();

  if (!hasAccess) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  const auditLog = team.auditLog
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(offset, offset + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: team.auditLog.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        auditLog,
      },
      'Audit log retrieved successfully'
    )
  );
});

/**
 * Get team billing information
 * GET /api/v1/teams/:teamId/billing
 */
const getTeamBilling = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user is owner
  if (team.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team owner can view billing information');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, team.billing, 'Billing information retrieved'));
});

/**
 * Get team shared services
 * GET /api/v1/teams/:teamId/services
 */
const getSharedServices = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const team = await Team.findById(teamId).populate('sharedServices');

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user has access
  const hasAccess = team.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  ) || team.owner.toString() === req.user._id.toString();

  if (!hasAccess) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  const services = team.sharedServices.slice(offset, offset + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: team.sharedServices.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        services,
      },
      'Team services retrieved successfully'
    )
  );
});

/**
 * Delete team
 * DELETE /api/v1/teams/:teamId
 */
const deleteTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user is owner
  if (team.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team owner can delete team');
  }

  await Team.findByIdAndDelete(teamId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Team deleted successfully'));
});

export {
  createTeam,
  getTeam,
  getUserTeams,
  updateTeam,
  inviteMember,
  acceptInvitation,
  getTeamMembers,
  updateMemberRole,
  removeMember,
  getAuditLog,
  getTeamBilling,
  getSharedServices,
  deleteTeam,
};
