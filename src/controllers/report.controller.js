import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import * as reportService from "../services/report.service.js";

export const listReports = asyncHandler(async (req, res) => {
  const list = await reportService.listReports();
  return success(res, list);
});

export const generateReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateReport(req.body);
  return created(res, report);
});

export const deleteReport = asyncHandler(async (req, res) => {
  const result = await reportService.deleteReport(req.params.id);
  return success(res, null, result.message);
});

export const deleteAllReports = asyncHandler(async (req, res) => {
  const result = await reportService.deleteAllReports();
  return success(res, null, result.message);
});

export const downloadReport = asyncHandler(async (req, res) => {
  const { buffer, contentType, filename } = await reportService.downloadReport(
    req.params.id
  );

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(buffer);
});