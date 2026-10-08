import mongoose from "mongoose";
import { ORDER_STATUS_VALUES, ORDER_STATUS } from "../constants/status.js";

const addressSnapshotSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customer: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: true },
    userId: { type: String, default: null, index: true },
    channel: { type: String, required: true },
    table: { type: String, default: null },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.PENDING,
    },
    payment: { type: String, default: "Card" },
    items: { type: [String], default: [] },
    addressId: { type: String, default: null },
    address: { type: addressSnapshotSchema, default: null },
    phone: { type: String, default: null },
    total: { type: Number, required: true, default: 0 },
    time: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

orderSchema.index({ email: 1, time: -1 });

export const Order = mongoose.model("Order", orderSchema, "orders");