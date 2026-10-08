import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { setAuthCookie, clearAuthCookie } from "../utils/cookies.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  setAuthCookie(res, token);
  return created(res, { user }, "Registration successful");
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  setAuthCookie(res, token);
  return success(res, { user }, "Login successful");
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return success(res, { user }, "Current user");
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return success(res, null, "Logged out successfully");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body.email);
  return success(res, null, result.message);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(
    req.params.token,
    req.body.password
  );
  return success(res, null, result.message);
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  return success(res, null, result.message);
});

export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const { signToken } = await import("../utils/jwt.js");
  const token = signToken({ userId: user._id.toString(), role: user.role || "user" });
  setAuthCookie(res, token);
  res.redirect(process.env.CLIENT_ORIGIN || "http://localhost:3000");
});

export const facebookCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const { signToken } = await import("../utils/jwt.js");
  const token = signToken({ userId: user._id.toString(), role: user.role || "user" });
  setAuthCookie(res, token);
  res.redirect(process.env.CLIENT_ORIGIN || "http://localhost:3000");
});