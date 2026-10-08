import { z } from "zod";

export const generateReportSchema = z.object({
  name: z.string().trim().min(1, "Report name is required"),
  format: z.enum(["PDF", "CSV", "XLSX"]).optional().default("PDF"),
});