import mongoose from "mongoose";
import { PRODUCT_STATUS_VALUES, PRODUCT_STATUS } from "../constants/status.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    category: { type: String, default: "", index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: {
      type: String,
      enum: PRODUCT_STATUS_VALUES,
      default: PRODUCT_STATUS.ACTIVE,
    },
    images: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    diet: { type: String, default: "" },
    cuisine: { type: String, default: "" },
    spiceLevel: { type: Number, default: 0, min: 0, max: 5 },
    prepTime: { type: Number, default: 0, min: 0 },
    calories: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isfeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    timestamp: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = mongoose.model("Product", productSchema, "products");