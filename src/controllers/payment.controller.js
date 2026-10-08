import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import * as paymentService from "../services/payment.service.js";

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const data = await paymentService.createPaymentIntent(req.body.price);
  return success(res, data);
});

export const listPayments = asyncHandler(async (req, res) => {
  const list = await paymentService.listAllPayments();
  return success(res, list);
});

export const paymentsByEmail = asyncHandler(async (req, res) => {
  const list = await paymentService.listPaymentsByEmail(
    req.params.email,
    req.user
  );
  return success(res, list);
});

export const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req.user || null);
  return created(res, payment);
});