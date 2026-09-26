import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  if (!name && !email) {
    throw new ApiError(400, "Name or email is required to update profile");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name) {
    user.name = name;
  }
  if (email) {
    // Optional: Check if the new email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(409, "Email is already in use by another account.");
      }
      user.email = email;
    }
  }

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(userId).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

/**
 * Updates which emails this account receives.
 *
 * Each preference is applied only when the request actually names it, so a
 * client that knows about one toggle cannot reset the others by omitting them.
 * Webhooks are deliberately not covered here: muting email must not silently
 * mute an on-call channel.
 */
const updateNotificationPrefs = asyncHandler(async (req, res) => {
  const { incidentEmails, sslExpiry, weeklyReport } = req.body ?? {};

  const update = {};
  if (typeof incidentEmails === "boolean") update["notificationPrefs.incidentEmails"] = incidentEmails;
  if (typeof sslExpiry === "boolean") update["notificationPrefs.sslExpiry"] = sslExpiry;
  if (typeof weeklyReport === "boolean") update["notificationPrefs.weeklyReport"] = weeklyReport;

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "Provide at least one preference to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user.notificationPrefs, "Notification preferences updated"));
});

export { updateUserProfile, updateNotificationPrefs };
