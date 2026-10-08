import { Report } from "../models/Report.js";
import { ApiError } from "../utils/ApiError.js";
import { oid, toClient } from "../utils/helpers.js";
import {
  buildCsv,
  buildXlsx,
  buildPdf,
  buildReportRows,
} from "../utils/report-builder.js";

export const listReports = async () => {
  const list = await Report.find().sort({ _id: -1 });
  return list.map(toClient);
};

export const generateReport = async ({ name, format }) => {
  const doc = await Report.create({
    name: name || "Custom report",
    desc: "Generated on demand",
    range: "Last 30 days",
    format: format || "PDF",
    size: `${(200 + Math.random() * 900).toFixed(0)} KB`,
    updated: "Just now",
  });
  return toClient(doc);
};

export const deleteReport = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid report id");
  const result = await Report.deleteOne({ _id });
  if (result.deletedCount === 0) throw ApiError.notFound("Report not found");
  return { message: "Report deleted" };
};

export const deleteAllReports = async () => {
  const result = await Report.deleteMany({});
  return { message: `${result.deletedCount} reports deleted` };
};

export const downloadReport = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid report id");

  const report = await Report.findById(_id);
  if (!report) throw ApiError.notFound("Report not found");

  const format = (report.format || "CSV").toUpperCase();
  const safeName = (report.name || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const stamp = new Date().toISOString().slice(0, 10);
  const rows = await buildReportRows(report);

  if (format === "CSV") {
    return {
      buffer: Buffer.from(buildCsv(report, rows), "utf-8"),
      contentType: "text/csv; charset=utf-8",
      filename: `${safeName}-${stamp}.csv`,
    };
  }

  if (format === "XLSX") {
    return {
      buffer: buildXlsx(report, rows),
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `${safeName}-${stamp}.xlsx`,
    };
  }

  if (format === "PDF") {
    const buffer = await buildPdf(report, rows);
    return {
      buffer,
      contentType: "application/pdf",
      filename: `${safeName}-${stamp}.pdf`,
    };
  }

  throw ApiError.badRequest(`Unsupported format: ${format}`);
};