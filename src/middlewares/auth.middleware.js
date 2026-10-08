import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME_EXPORT as COOKIE_NAME } from "../utils/cookies.js";

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7).trim();
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  return null;
};

const resolveUser = async (token) => {
  const decoded = verifyToken(token);
  const userId = decoded.userId || decoded.id;
  if (!userId) return null;

  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpires"
  );
  return user;
};

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Not authenticated");

  let user;
  try {
    user = await resolveUser(token);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  if (!user) throw ApiError.unauthorized("User no longer exists");

  req.user = {
    id: user._id.toString(),
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role || "user",
    doc: user,
  };

  next();
});