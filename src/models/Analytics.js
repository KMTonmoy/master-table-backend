import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    segments: { type: [mongoose.Schema.Types.Mixed], default: [] },
    steps: { type: [mongoose.Schema.Types.Mixed], default: [] },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, strict: false }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema, "analytics");