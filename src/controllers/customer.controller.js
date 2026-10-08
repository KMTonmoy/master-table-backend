import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { toClient } from "../utils/helpers.js";
import * as customerService from "../services/customer.service.js";

export const listCustomers = asyncHandler(async (req, res) => {
  const list = await customerService.listCustomers(req.query);
  return success(res, list);
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  return created(res, toClient(customer));
});