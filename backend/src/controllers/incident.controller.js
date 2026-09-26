import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Incident from '../models/incident.model.js';
import Monitoring from '../models/monitoring.model.js';

/**
 * Incident Management Controller
 * Handles incident creation, timeline tracking, RCA, customer communication, and resolution
 */

/**
 * Create a new incident
 * POST /api/v1/incidents
 */
const createIncident = asyncHandler(async (req, res) => {
  const {
    monitoringId,
    title,
    description,
    severity,
    affectedServices,
    affectedUsers,
    detectedAt,
  } = req.body;

  // Validate monitoring service exists
  if (monitoringId) {
    const monitoring = await Monitoring.findById(monitoringId);
    if (!monitoring) {
      throw new ApiError(404, 'Monitoring service not found');
    }
  }

  const incident = await Incident.create({
    monitoringId,
    title,
    description,
    severity: severity || 'medium',
    status: 'investigating',
    createdBy: req.user._id,
    affectedServices,
    affectedUsers,
    timeline: [
      {
        type: 'incident_created',
        title: 'Incident reported',
        description: 'Incident was created and investigation started',
        timestamp: detectedAt || new Date(),
        createdBy: req.user._id,
      },
    ],
    impactMetrics: {
      detectedAt: detectedAt || new Date(),
      statusPageUpdatedAt: new Date(),
    },
  });

  // Populate references
  await incident.populate(['monitoringId', 'createdBy']);

  return res
    .status(201)
    .json(new ApiResponse(201, incident, 'Incident created successfully'));
});

/**
 * Get incident by ID
 * GET /api/v1/incidents/:incidentId
 */
const getIncidentById = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;

  const incident = await Incident.findById(incidentId)
    .populate(['monitoringId', 'createdBy', 'resolvedBy'])
    .lean();

  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, incident, 'Incident retrieved successfully'));
});

/**
 * List incidents with filters
 * GET /api/v1/incidents
 */
const listIncidents = asyncHandler(async (req, res) => {
  const {
    status = 'all',
    severity = 'all',
    monitoringId,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  let query = {};

  if (status !== 'all') query.status = status;
  if (severity !== 'all') query.severity = severity;
  if (monitoringId) query.monitoringId = monitoringId;

  const incidents = await Incident.find(query)
    .populate(['monitoringId', 'createdBy'])
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .lean();

  const total = await Incident.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        incidents,
      },
      'Incidents retrieved successfully'
    )
  );
});

/**
 * Get incidents for a specific service
 * GET /api/v1/monitoring/:serviceId/incidents
 */
const getServiceIncidents = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const incidents = await Incident.find({ monitoringId: serviceId })
    .populate(['createdBy', 'resolvedBy'])
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Incident.countDocuments({ monitoringId: serviceId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        incidents,
      },
      'Service incidents retrieved successfully'
    )
  );
});

/**
 * Update incident status
 * PATCH /api/v1/incidents/:incidentId/status
 */
const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;
  const { status, message } = req.body;

  const validStatuses = ['investigating', 'identified', 'monitoring', 'resolved'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const incident = await Incident.findById(incidentId);
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  // Record status change in timeline
  incident.timeline.push({
    type: `incident_${status}`,
    title: `Incident status changed to ${status}`,
    description: message || '',
    timestamp: new Date(),
    createdBy: req.user._id,
  });

  incident.status = status;

  if (status === 'resolved') {
    incident.resolvedAt = new Date();
    incident.resolvedBy = req.user._id;
    incident.impactMetrics.duration = incident.resolvedAt - incident.impactMetrics.detectedAt;
  }

  await incident.save();

  return res
    .status(200)
    .json(new ApiResponse(200, incident, 'Incident status updated successfully'));
});

/**
 * Add timeline event
 * POST /api/v1/incidents/:incidentId/timeline
 */
const addTimelineEvent = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;
  const { title, description, type } = req.body;

  const incident = await Incident.findById(incidentId);
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  incident.timeline.push({
    type: type || 'update',
    title,
    description,
    timestamp: new Date(),
    createdBy: req.user._id,
  });

  await incident.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, incident, 'Timeline event added successfully')
    );
});

/**
 * Get incident timeline
 * GET /api/v1/incidents/:incidentId/timeline
 */
const getIncidentTimeline = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;

  const incident = await Incident.findById(incidentId).populate('timeline.createdBy');
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          incidentId: incident._id,
          timeline: incident.timeline.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          ),
        },
        'Timeline retrieved successfully'
      )
    );
});

/**
 * Add root cause analysis (RCA)
 * POST /api/v1/incidents/:incidentId/rca
 */
const addRCA = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;
  const {
    rootCause,
    contributingFactors,
    immediateActions,
    preventiveActions,
    lessons,
  } = req.body;

  const incident = await Incident.findById(incidentId);
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  incident.rca = {
    rootCause,
    contributingFactors: contributingFactors || [],
    immediateActions: immediateActions || [],
    preventiveActions: preventiveActions || [],
    lessons: lessons || [],
    completedAt: new Date(),
    completedBy: req.user._id,
  };

  incident.timeline.push({
    type: 'rca_completed',
    title: 'Root Cause Analysis completed',
    description: `RCA identified root cause: ${rootCause}`,
    timestamp: new Date(),
    createdBy: req.user._id,
  });

  await incident.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, incident.rca, 'RCA added successfully')
    );
});

/**
 * Get RCA for incident
 * GET /api/v1/incidents/:incidentId/rca
 */
const getRCA = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;

  const incident = await Incident.findById(incidentId).populate('rca.completedBy');
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  if (!incident.rca) {
    throw new ApiError(404, 'No RCA found for this incident');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, incident.rca, 'RCA retrieved successfully'));
});

/**
 * Update impact metrics
 * PATCH /api/v1/incidents/:incidentId/impact
 */
const updateImpactMetrics = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;
  const {
    affectedUsers,
    affectedSessions,
    errorRate,
    performanceDegradation,
  } = req.body;

  const incident = await Incident.findById(incidentId);
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  if (affectedUsers !== undefined) incident.impactMetrics.affectedUsers = affectedUsers;
  if (affectedSessions !== undefined) incident.impactMetrics.affectedSessions = affectedSessions;
  if (errorRate !== undefined) incident.impactMetrics.errorRate = errorRate;
  if (performanceDegradation !== undefined) {
    incident.impactMetrics.performanceDegradation = performanceDegradation;
  }

  await incident.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        incident.impactMetrics,
        'Impact metrics updated successfully'
      )
    );
});

/**
 * Publish customer communication
 * POST /api/v1/incidents/:incidentId/communication
 */
const publishCommunication = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;
  const { message, channels } = req.body;

  const incident = await Incident.findById(incidentId);
  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  const communication = {
    message,
    channels: channels || ['status_page', 'email'],
    sentAt: new Date(),
    sentBy: req.user._id,
  };

  incident.customerCommunications.push(communication);

  incident.timeline.push({
    type: 'communication_sent',
    title: 'Customer communication published',
    description: `Message sent via: ${channels?.join(', ') || 'status page'}`,
    timestamp: new Date(),
    createdBy: req.user._id,
  });

  await incident.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, communication, 'Communication published successfully')
    );
});

/**
 * Get incident communications
 * GET /api/v1/incidents/:incidentId/communications
 */
const getIncidentCommunications = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;

  const incident = await Incident.findById(incidentId).populate(
    'customerCommunications.sentBy'
  );

  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        incidentId: incident._id,
        communications: incident.customerCommunications,
      },
      'Communications retrieved successfully'
    )
  );
});

/**
 * Get incident statistics
 * GET /api/v1/incidents/stats/overview
 */
const getIncidentStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = {
    totalIncidents: await Incident.countDocuments({ createdAt: { $gte: startDate } }),
    openIncidents: await Incident.countDocuments({
      createdAt: { $gte: startDate },
      status: { $in: ['investigating', 'identified', 'monitoring'] },
    }),
    resolvedIncidents: await Incident.countDocuments({
      createdAt: { $gte: startDate },
      status: 'resolved',
    }),
    bySeverity: {},
    averageResolutionTime: 0,
  };

  // Count by severity
  for (const severity of ['critical', 'high', 'medium', 'low']) {
    stats.bySeverity[severity] = await Incident.countDocuments({
      createdAt: { $gte: startDate },
      severity,
    });
  }

  // Calculate average resolution time
  const resolvedIncidents = await Incident.find({
    createdAt: { $gte: startDate },
    status: 'resolved',
    resolvedAt: { $exists: true },
  });

  if (resolvedIncidents.length > 0) {
    const totalTime = resolvedIncidents.reduce(
      (sum, i) => sum + (i.resolvedAt - i.createdAt),
      0
    );
    stats.averageResolutionTime = Math.round(totalTime / resolvedIncidents.length / 1000 / 60); // minutes
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, 'Incident statistics retrieved successfully')
    );
});

/**
 * Delete incident
 * DELETE /api/v1/incidents/:incidentId
 */
const deleteIncident = asyncHandler(async (req, res) => {
  const { incidentId } = req.params;

  const result = await Incident.findByIdAndDelete(incidentId);

  if (!result) {
    throw new ApiError(404, 'Incident not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Incident deleted successfully'));
});

export {
  createIncident,
  getIncidentById,
  listIncidents,
  getServiceIncidents,
  updateIncidentStatus,
  addTimelineEvent,
  getIncidentTimeline,
  addRCA,
  getRCA,
  updateImpactMetrics,
  publishCommunication,
  getIncidentCommunications,
  getIncidentStats,
  deleteIncident,
};
