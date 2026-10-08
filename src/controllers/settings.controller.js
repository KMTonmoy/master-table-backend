import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import * as settingsService from "../services/settings.service.js";

export const getSettings = asyncHandler(async (req, res) => {
  const data = await settingsService.getSettings();
  return success(res, data);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = await settingsService.updateSettings(req.body);
  return success(res, data, "Settings updated");
});