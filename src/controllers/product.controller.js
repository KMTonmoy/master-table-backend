import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { toClient } from "../utils/helpers.js";
import { keywordSearch } from "../utils/search.js";
import * as productService from "../services/product.service.js";

export const listProducts = asyncHandler(async (req, res) => {
  const list = await productService.getAllProducts(req.query);
  return success(res, list.map(toClient));
});

export const listPublicProducts = asyncHandler(async (req, res) => {
  const list = await productService.getPublicProducts(req.query);
  return success(res, list);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return success(res, toClient(product));
});

export const keywordProducts = asyncHandler(async (req, res) => {
  const result = await keywordSearch(req.query.q, {
    limit: Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 60),
    mapFn: (doc) => {
      const clean = toClient(doc);
      return { ...clean, _id: clean.id };
    },
  });
  return success(res, result);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return created(res, toClient(product));
});

export const createPublicProduct = asyncHandler(async (req, res) => {
  const product = await productService.createPublicProduct(req.body);
  return created(res, { message: "Product created successfully", product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return success(res, toClient(product));
});

export const replaceProduct = asyncHandler(async (req, res) => {
  const product = await productService.replaceProduct(req.params.id, req.body);
  return success(res, { message: "Product updated successfully", product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  return success(res, null, result.message);
});