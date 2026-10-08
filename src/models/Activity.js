import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    tone: { type: String, default: "gold" },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const Activity = mongoose.model("Activity", activitySchema, "activity");