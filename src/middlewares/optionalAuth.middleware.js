import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME_EXPORT as COOKIE_NAME } from "../utils/cookies.js";

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7).trim();
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  return null;
};

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId || decoded.id;
    if (!userId) return next();

    const user = await User.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );
    if (!user) return next();

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
      doc: user,
    };
  } catch {
    // silent fail — optional auth
  }

  next();
});