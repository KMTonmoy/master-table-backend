import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null, index: true },
    email: { type: String, lowercase: true, default: "", index: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "usd" },
    method: { type: String, default: "Card" },
    status: { type: String, default: "Pending" },
    transactionId: { type: String, default: null },
    orderId: { type: String, default: null, index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, strict: false }
);

export const Payment = mongoose.model("Payment", paymentSchema, "payments");