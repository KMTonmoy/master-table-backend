import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, index: true },
    city: { type: String, default: "" },
    orders: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    tier: { type: String, default: "Regular" },
    lastVisit: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", customerSchema, "customers");