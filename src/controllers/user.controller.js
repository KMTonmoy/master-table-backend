import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { toClient } from "../utils/helpers.js";
import * as userService from "../services/user.service.js";

// ─── Admin ───────────────────────────────────────────────
export const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return success(res, { users: users.map(toClient) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return success(res, { user: toClient(user) });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUserAsAdmin(req.body);
  return created(res, { user });
});

export const updateRole = asyncHandler(async (req, res) => {
  const result = await userService.updateUserRole(req.params.id, req.body.role);
  return success(res, null, result.message);
});

export const removeUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  return success(res, null, result.message);
});

// ─── Me ──────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  return success(res, { user: toClient(user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.id, req.body);
  return success(res, { user });
});

export const updatePhone = asyncHandler(async (req, res) => {
  const result = await userService.updatePhone(req.user.id, req.body.phone);
  return success(res, result);
});

// ─── Addresses ───────────────────────────────────────────
export const listAddresses = asyncHandler(async (req, res) => {
  const result = await userService.listAddresses(req.user.id);
  return success(res, result);
});

export const addAddress = asyncHandler(async (req, res) => {
  const address = await userService.addAddress(req.user.id, req.body);
  return created(res, { address });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await userService.updateAddress(
    req.user.id,
    req.params.id,
    req.body
  );
  return success(res, { address });
});

export const removeAddress = asyncHandler(async (req, res) => {
  const result = await userService.deleteAddress(req.user.id, req.params.id);
  return success(res, null, result.message);
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const result = await userService.setDefaultAddress(req.user.id, req.params.id);
  return success(res, result);
});