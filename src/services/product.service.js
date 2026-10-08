import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import {
  oid,
  normalizeImages,
  normalizeStringArray,
  parsePagination,
} from "../utils/helpers.js";

export const getAllProducts = async (query = {}) => {
  const { category, status, search, diet, isfeatured, isFeatured } = query;
  const filter = {};

  if (category && category !== "All") filter.category = category;
  if (status && status !== "All") filter.status = status;
  if (diet) filter.diet = diet;

  if (isfeatured !== undefined) filter.isfeatured = isfeatured === "true";
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

  if (search) filter.name = { $regex: String(search), $options: "i" };

  const { skip, limit } = parsePagination(query, {
    page: 1,
    limit: 200,
    maxLimit: 500,
  });

  return Product.find(filter).sort({ _id: -1 }).skip(skip).limit(limit);
};

export const getPublicProducts = async (query = {}) => {
  const { category, diet, isfeatured } = query;
  const filter = {};
  if (category) filter.category = category;
  if (diet) filter.diet = diet;
  if (isfeatured !== undefined) filter.isfeatured = isfeatured === "true";
  return Product.find(filter).sort({ _id: -1 });
};

export const getProductById = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid product id");
  const product = await Product.findById(_id);
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

export const createProduct = async (body) => {
  const p = body || {};
  if (!p.name || p.price === undefined || !p.category)
    throw ApiError.badRequest("Invalid product data");

  const doc = {
    name: p.name,
    description: p.description ?? "",
    category: p.category,
    price: Number(p.price),
    stock: Number(p.stock ?? 0),
    sold: Number(p.sold ?? 0),
    rating: Number(p.rating ?? 0),
    status: p.status ?? "Draft",
    images: normalizeImages(p.images),
    ingredients: normalizeStringArray(p.ingredients),
    diet: p.diet ?? "",
    cuisine: p.cuisine ?? "",
    spiceLevel: Number(p.spiceLevel ?? 0),
    prepTime: Number(p.prepTime ?? 0),
    calories: Number(p.calories ?? 0),
    tags: normalizeStringArray(p.tags),
    isFeatured: p.isFeatured === true,
    isfeatured: p.isfeatured === true || p.isFeatured === true,
    isAvailable: p.isAvailable !== false,
    timestamp: Date.now(),
  };

  return Product.create(doc);
};

export const createPublicProduct = async (body) => {
  const p = body || {};
  if (!p.name || p.price === undefined || !p.diet || !p.category)
    throw ApiError.badRequest("Invalid product data");

  const doc = {
    name: p.name,
    description: p.description ?? "",
    category: p.category,
    price: Number(p.price),
    stock: Number(p.stock ?? 0),
    sold: Number(p.sold ?? 0),
    rating: Number(p.rating ?? 0),
    status: p.status ?? "Active",
    images: normalizeImages(p.images),
    ingredients: normalizeStringArray(p.ingredients),
    diet: p.diet,
    cuisine: p.cuisine ?? "",
    spiceLevel: Number(p.spiceLevel ?? 0),
    prepTime: Number(p.prepTime ?? 0),
    calories: Number(p.calories ?? 0),
    tags: normalizeStringArray(p.tags),
    isFeatured: p.isFeatured === true,
    isfeatured: p.isfeatured === true || p.isFeatured === true,
    isAvailable: p.isAvailable !== false,
    timestamp: Date.now(),
  };

  return Product.create(doc);
};

const buildProductUpdate = (p) => {
  const update = {};
  if (p.name !== undefined) update.name = p.name;
  if (p.description !== undefined) update.description = p.description;
  if (p.category !== undefined) update.category = p.category;
  if (p.price !== undefined) update.price = Number(p.price);
  if (p.stock !== undefined) update.stock = Number(p.stock);
  if (p.sold !== undefined) update.sold = Number(p.sold);
  if (p.rating !== undefined) update.rating = Number(p.rating);
  if (p.status !== undefined) update.status = p.status;
  if (p.images !== undefined) update.images = normalizeImages(p.images);
  if (p.ingredients !== undefined)
    update.ingredients = normalizeStringArray(p.ingredients);
  if (p.diet !== undefined) update.diet = p.diet;
  if (p.cuisine !== undefined) update.cuisine = p.cuisine;
  if (p.spiceLevel !== undefined) update.spiceLevel = Number(p.spiceLevel);
  if (p.prepTime !== undefined) update.prepTime = Number(p.prepTime);
  if (p.calories !== undefined) update.calories = Number(p.calories);
  if (p.tags !== undefined) update.tags = normalizeStringArray(p.tags);
  if (p.isFeatured !== undefined) update.isFeatured = p.isFeatured === true;
  if (p.isfeatured !== undefined) update.isfeatured = p.isfeatured === true;
  if (p.isAvailable !== undefined) update.isAvailable = p.isAvailable !== false;
  return update;
};

export const updateProduct = async (id, body) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid product id");

  const update = buildProductUpdate(body || {});
  if (Object.keys(update).length === 0)
    throw ApiError.badRequest("No fields provided");

  const product = await Product.findByIdAndUpdate(_id, update, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

export const replaceProduct = async (id, body) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid product id");

  const p = body || {};
  if (!p.name || p.price === undefined || !p.diet || !p.category)
    throw ApiError.badRequest("Invalid product data");

  const update = {
    name: p.name,
    description: p.description ?? "",
    price: Number(p.price),
    diet: p.diet,
    category: p.category,
    isfeatured: p.isfeatured === true || p.isFeatured === true,
    images: normalizeImages(p.images),
    ingredients: normalizeStringArray(p.ingredients),
    cuisine: p.cuisine ?? "",
    spiceLevel: Number(p.spiceLevel ?? 0),
    prepTime: Number(p.prepTime ?? 0),
    calories: Number(p.calories ?? 0),
    tags: normalizeStringArray(p.tags),
    isFeatured: p.isFeatured === true,
    isAvailable: p.isAvailable !== false,
    status: p.status ?? "Active",
  };

  const product = await Product.findByIdAndUpdate(_id, update, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

export const deleteProduct = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid product id");
  const result = await Product.deleteOne({ _id });
  if (result.deletedCount === 0) throw ApiError.notFound("Product not found");
  return { message: "Product deleted successfully" };
};