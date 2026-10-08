import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, default: "" },
    range: { type: String, default: "Last 30 days" },
    format: { type: String, default: "PDF" },
    size: { type: String, default: "" },
    updated: { type: String, default: "Just now" },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema, "reports");