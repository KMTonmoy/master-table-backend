import Stripe from "stripe";
import { Payment } from "../models/Payment.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

let stripe = null;
if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY);
}

export const createPaymentIntent = async (price) => {
  if (!stripe) throw ApiError.internal("Stripe not configured");
  if (!price || Number(price) <= 0) throw ApiError.badRequest("Invalid price");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(price) * 100),
    currency: "usd",
    payment_method_types: ["card"],
  });

  return { clientSecret: paymentIntent.client_secret };
};

export const listAllPayments = () => Payment.find().sort({ createdAt: -1 });

export const listPaymentsByEmail = async (email, requester) => {
  if (requester.email !== String(email).toLowerCase() && requester.role !== "admin")
    throw ApiError.forbidden("Not authorized");
  return Payment.find({ email }).sort({ createdAt: -1 });
};

export const createPayment = async (body, user = null) => {
  const doc = { ...(body || {}) };
  if (user?.id) doc.userId = user.id;
  return Payment.create(doc);
};