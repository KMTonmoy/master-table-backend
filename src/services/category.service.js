import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { oid, pick } from "../utils/helpers.js";

export const getAllCategories = () => Category.find().sort({ _id: -1 });

export const getCategoryById = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid category id");
  const cat = await Category.findById(_id);
  if (!cat) throw ApiError.notFound("Category not found");
  return cat;
};

export const createCategory = async (body) => {
  const { name, description, image } = body || {};
  if (!name) throw ApiError.badRequest("Category name required");

  return Category.create({
    name,
    description: description || "",
    image: image || "",
    items: 0,
    revenue: 0,
    share: 0,
  });
};

export const updateCategory = async (id, body) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid category id");

  const update = pick(body, ["name", "description", "image", "items", "revenue", "share"]);
  if (Object.keys(update).length === 0)
    throw ApiError.badRequest("No fields provided");

  const cat = await Category.findByIdAndUpdate(_id, update, {
    new: true,
    runValidators: true,
  });
  if (!cat) throw ApiError.notFound("Category not found");
  return cat;
};

export const deleteCategory = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid category id");
  const result = await Category.deleteOne({ _id });
  if (result.deletedCount === 0) throw ApiError.notFound("Category not found");
  return { message: "Category deleted" };
};