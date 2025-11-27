import mongoose from 'mongoose';

const maintenanceWindowSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Monitoring', // Assuming your Monitoring service model is named 'Monitoring'
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming your User model is named 'User'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model('MaintenanceWindow', maintenanceWindowSchema);