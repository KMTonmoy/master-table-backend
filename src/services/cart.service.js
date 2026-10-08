import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { oid, clamp } from "../utils/helpers.js";
import { buildCartResponse } from "../utils/cart-builder.js";

export const getCart = (userId) => buildCartResponse(userId);

export const addItem = async (userId, email, { productId, quantity }) => {
  const _id = oid(productId);
  if (!_id) throw ApiError.badRequest("Invalid product id");

  const qty = clamp(Number(quantity) || 1, 1, 99);
  const product = await Product.findById(_id);
  if (!product) throw ApiError.notFound("Product not found");

  const now = new Date();
  const existing = await Cart.findOne({ userId });

  if (!existing) {
    await Cart.create({
      userId,
      email,
      items: [
        {
          productId: String(_id),
          quantity: qty,
          priceSnapshot: Number(product.price) || 0,
          nameSnapshot: product.name || "",
          addedAt: now,
        },
      ],
    });
  } else {
    const idx = existing.items.findIndex(
      (i) => String(i.productId) === String(_id)
    );
    if (idx >= 0) {
      existing.items[idx].quantity = clamp(existing.items[idx].quantity + qty, 1, 99);
      existing.items[idx].priceSnapshot = Number(product.price) || existing.items[idx].priceSnapshot || 0;
      existing.items[idx].nameSnapshot = product.name || existing.items[idx].nameSnapshot || "";
    } else {
      existing.items.push({
        productId: String(_id),
        quantity: qty,
        priceSnapshot: Number(product.price) || 0,
        nameSnapshot: product.name || "",
        addedAt: now,
      });
    }
    await existing.save();
  }

  return buildCartResponse(userId);
};

export const updateItem = async (userId, productId, quantity) => {
  const _id = oid(productId);
  if (!_id) throw ApiError.badRequest("Invalid product id");

  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty)) throw ApiError.badRequest("Invalid quantity");

  const existing = await Cart.findOne({ userId });
  if (!existing) throw ApiError.notFound("Cart is empty");

  if (qty <= 0) {
    existing.items = existing.items.filter(
      (i) => String(i.productId) !== String(_id)
    );
  } else {
    const idx = existing.items.findIndex(
      (i) => String(i.productId) === String(_id)
    );
    if (idx < 0) throw ApiError.notFound("Item not in cart");
    existing.items[idx].quantity = clamp(qty, 1, 99);
  }

  await existing.save();
  return buildCartResponse(userId);
};

export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { upsert: true }
  );
  return { items: [], count: 0, subtotal: 0 };
};