import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import * as cartService from "../services/cart.service.js";

export const getCart = asyncHandler(async (req, res) => {
  const data = await cartService.getCart(req.user.id);
  return success(res, data);
});

export const addItem = asyncHandler(async (req, res) => {
  const data = await cartService.addItem(req.user.id, req.user.email, req.body);
  return success(res, data);
});

export const updateItem = asyncHandler(async (req, res) => {
  const data = await cartService.updateItem(
    req.user.id,
    req.params.productId,
    req.body.quantity
  );
  return success(res, data);
});

export const clearCart = asyncHandler(async (req, res) => {
  const data = await cartService.clearCart(req.user.id);
  return success(res, data);
});