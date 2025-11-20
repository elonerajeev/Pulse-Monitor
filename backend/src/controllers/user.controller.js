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

export { updateUserProfile };
