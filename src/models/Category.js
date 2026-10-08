import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    items: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    share: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema, "categories");