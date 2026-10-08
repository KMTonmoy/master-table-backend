import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { oid } from "./helpers.js";

export const buildCartResponse = async (userId) => {
  if (!userId) return { items: [], count: 0, subtotal: 0 };

  const cart = await Cart.findOne({ userId });
  const rawItems = Array.isArray(cart?.items) ? cart.items : [];
  if (rawItems.length === 0) return { items: [], count: 0, subtotal: 0 };

  const ids = rawItems
    .map((item) => oid(item.productId))
    .filter((id) => id !== null);

  const productDocs = ids.length
    ? await Product.find({ _id: { $in: ids } }).lean()
    : [];
  const byId = new Map(productDocs.map((p) => [String(p._id), p]));

  const items = rawItems.map((item) => {
    const product = byId.get(String(item.productId));
    const price = Number(product?.price ?? item.priceSnapshot ?? 0);
    const quantity = Math.max(1, Number(item.quantity) || 1);

    const deleted = !product;
    const outOfStock =
      !!product &&
      (Number(product.stock) <= 0 || product.status === "Out of stock");
    const unavailableFlag = !!product && product.isAvailable === false;

    const reason = deleted
      ? "This item is no longer on the menu."
      : outOfStock
      ? "Out of stock."
      : unavailableFlag
      ? "Currently unavailable."
      : null;

    return {
      productId: String(item.productId),
      name: product?.name ?? item.nameSnapshot ?? "Removed item",
      emoji: product?.emoji ?? "🍽️",
      image:
        Array.isArray(product?.images) && product.images[0]
          ? product.images[0]
          : null,
      category: product?.category ?? "",
      price,
      priceChanged: !!product && price !== Number(item.priceSnapshot ?? price),
      quantity,
      lineTotal: +(price * quantity).toFixed(2),
      available: !deleted && !outOfStock && !unavailableFlag,
      reason,
      addedAt: item.addedAt ?? null,
    };
  });

  const subtotal = items
    .filter((i) => i.available)
    .reduce((sum, i) => sum + i.lineTotal, 0);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, count, subtotal: +subtotal.toFixed(2) };
};