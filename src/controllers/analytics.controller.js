import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import * as analyticsService from "../services/analytics.service.js";

export const traffic = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTrafficSources();
  return success(res, data);
});

export const funnel = asyncHandler(async (req, res) => {
  const data = await analyticsService.getFunnel();
  return success(res, data);
});

export const weekdayOrders = asyncHandler(async (req, res) => {
  const data = await analyticsService.getWeekdayOrders();
  return success(res, data);
});

export const heatmap = asyncHandler(async (req, res) => {
  const data = await analyticsService.getHeatmap();
  return success(res, data);
});

export const topDishes = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTopDishes();
  return success(res, data);
});