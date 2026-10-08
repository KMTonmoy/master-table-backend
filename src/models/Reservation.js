import mongoose from "mongoose";
import {
  RESERVATION_STATUS_VALUES,
  RESERVATION_STATUS,
} from "../constants/status.js";

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, index: true },
    userId: { type: String, default: null, index: true },
    phone: { type: String, required: true },
    date: { type: String, required: true, index: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 50 },
    occasion: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: RESERVATION_STATUS_VALUES,
      default: RESERVATION_STATUS.PENDING,
    },
    table: { type: String, default: null },
  },
  { timestamps: true }
);

export const Reservation = mongoose.model(
  "Reservation",
  reservationSchema,
  "reservations"
);