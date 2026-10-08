import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import * as orderService from "../services/order.service.js";

export const createOrder = asyncHandler(async (req, res) => {
  const result = await orderService.createOrder(req.body, req.user || null);
  return created(res, { message: "Order created", ...result });
});

export const listOrders = asyncHandler(async (req, res) => {
  const list = await orderService.listOrders(req.query);
  return success(res, list);
});

export const myOrders = asyncHandler(async (req, res) => {
  const list = await orderService.getMyOrders(req.user);
  return success(res, list);
});

export const ordersByEmail = asyncHandler(async (req, res) => {
  const list = await orderService.getOrdersByEmail(req.params.email, req.user);
  return success(res, list);
});

export const orderHistory = asyncHandler(async (req, res) => {
  const result = await orderService.getOrderHistory(
    req.params.email,
    req.user,
    req.query
  );
  return success(res, result);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId, req.user);
  return success(res, order);
});

export const updateOrder = asyncHandler(async (req, res) => {
  const result = await orderService.updateOrder(req.params.orderId, req.body);
  return success(res, null, result.message);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const result = await orderService.cancelOrder(req.params.orderId, req.user);
  return success(res, null, result.message);
});