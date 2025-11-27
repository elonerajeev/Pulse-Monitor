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

// If you want to manually define createdAt and updatedAt, you can do this:
// maintenanceWindowSchema.add({
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

export default mongoose.model('MaintenanceWindow', maintenanceWindowSchema);