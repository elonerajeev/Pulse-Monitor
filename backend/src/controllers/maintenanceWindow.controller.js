import MaintenanceWindow from '../models/maintenanceWindow.model.js';
import { Monitoring } from '../models/monitoring.model.js'; // Assuming you'll need Monitoring model for validation or linking
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const createMaintenanceWindow = asyncHandler(async (req, res) => {
  const { serviceId, startTime, endTime, reason } = req.body;

  if (!serviceId || !startTime || !endTime || !reason) {
    throw new ApiError(400, 'Service ID, start time, end time, and reason are required');
  }

  // Validate serviceId exists
  const service = await Monitoring.findById(serviceId);
  if (!service) {
    throw new ApiError(404, 'Monitoring service not found');
  }

  const maintenanceWindow = await MaintenanceWindow.create({
    serviceId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    reason,
    createdBy: req.user._id, // Assuming req.user is populated by auth middleware
  });

  if (!maintenanceWindow) {
    throw new ApiError(500, 'Something went wrong while creating the maintenance window');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, maintenanceWindow, 'Maintenance window created successfully'));
});

const getAllMaintenanceWindows = asyncHandler(async (req, res) => {
  const { serviceId } = req.query;
  const query = { createdBy: req.user._id }; // Filter by user who created it

  if (serviceId) {
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(400, "Invalid service ID");
    }
    query.serviceId = serviceId;
  }

  const maintenanceWindows = await MaintenanceWindow.find(query).populate('serviceId', 'name target');

  return res
    .status(200)
    .json(new ApiResponse(200, maintenanceWindows, 'Maintenance windows retrieved successfully'));
});

const getSingleMaintenanceWindow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid maintenance window ID');
  }

  const maintenanceWindow = await MaintenanceWindow.findById(id).populate('serviceId', 'name target');

  if (!maintenanceWindow) {
    throw new ApiError(404, 'Maintenance window not found');
  }

  // Ensure user owns this maintenance window
  if (maintenanceWindow.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to view this maintenance window');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, maintenanceWindow, 'Maintenance window retrieved successfully'));
});

const updateMaintenanceWindow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, reason, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid maintenance window ID');
  }

  const maintenanceWindow = await MaintenanceWindow.findById(id);

  if (!maintenanceWindow) {
    throw new ApiError(404, 'Maintenance window not found');
  }

  // Ensure user owns this maintenance window
  if (maintenanceWindow.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this maintenance window');
  }

  const updatedMaintenanceWindow = await MaintenanceWindow.findByIdAndUpdate(
    id,
    {
      $set: {
        startTime: startTime ? new Date(startTime) : maintenanceWindow.startTime,
        endTime: endTime ? new Date(endTime) : maintenanceWindow.endTime,
        reason: reason || maintenanceWindow.reason,
        isActive: typeof isActive === 'boolean' ? isActive : maintenanceWindow.isActive,
      },
    },
    { new: true }
  );

  if (!updatedMaintenanceWindow) {
    throw new ApiError(500, 'Something went wrong while updating the maintenance window');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMaintenanceWindow, 'Maintenance window updated successfully'));
});

const deleteMaintenanceWindow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid maintenance window ID');
  }

  const maintenanceWindow = await MaintenanceWindow.findById(id);

  if (!maintenanceWindow) {
    throw new ApiError(404, 'Maintenance window not found');
  }

  // Ensure user owns this maintenance window
  if (maintenanceWindow.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this maintenance window');
  }

  await MaintenanceWindow.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Maintenance window deleted successfully'));
});

export {
  createMaintenanceWindow,
  getAllMaintenanceWindows,
  getSingleMaintenanceWindow,
  updateMaintenanceWindow,
  deleteMaintenanceWindow,
};