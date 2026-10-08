import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import * as dashboardService from "../services/dashboard.service.js";

export const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  return success(res, data);
});

export const revenue = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenue(req.query.range);
  return success(res, data);
});

export const reservations = asyncHandler(async (req, res) => {
  const list = await dashboardService.getDashboardReservations(req.query);
  return success(res, list);
});

export const activity = asyncHandler(async (req, res) => {
  const list = await dashboardService.getRecentActivity(8);
  return success(res, list);
});