import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("Attempting to verify JWT...");
    console.log("Cookies: ", req.cookies);
    console.log("Token: ", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new ApiError(500, "ACCESS_TOKEN_SECRET is not defined");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded token: ", decodedToken);

    const user = await User.findById(decodedToken?.id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error: ", error.message);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});