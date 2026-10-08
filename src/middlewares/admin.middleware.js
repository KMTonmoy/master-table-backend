import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return next(ApiError.forbidden("Admin access required"));
  }
  next();
};