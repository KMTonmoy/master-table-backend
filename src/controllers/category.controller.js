import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { toClient } from "../utils/helpers.js";
import * as categoryService from "../services/category.service.js";

export const listCategories = asyncHandler(async (req, res) => {
  const list = await categoryService.getAllCategories();
  return success(res, list.map(toClient));
});

export const getCategory = asyncHandler(async (req, res) => {
  const cat = await categoryService.getCategoryById(req.params.id);
  return success(res, toClient(cat));
});

export const createCategory = asyncHandler(async (req, res) => {
  const cat = await categoryService.createCategory(req.body);
  return created(res, toClient(cat));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await categoryService.updateCategory(req.params.id, req.body);
  return success(res, toClient(cat));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  return success(res, null, result.message);
});