import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Cart } from "../models/Cart.js";
import { Activity } from "../models/Activity.js";
import { ApiError } from "../utils/ApiError.js";
import { formatOrder } from "../utils/order-format.js";
import { pick, isValidEmail } from "../utils/helpers.js";

const logActivity = async (text, tone = "gold") => {
  try {
    await Activity.create({ text, tone, createdAt: new Date() });
  } catch (e) {
    console.error("activity log failed:", e.message);
  }
};

const snapshotAddress = (address, phone) => {
  if (!address || typeof address !== "object") return null;
  return {
    label: address.label || "",
    line1: address.line1 || "",
    line2: address.line2 || "",
    city: address.city || "",
    postalCode: address.postalCode || "",
    country: address.country || "",
    phone: phone || address.phone || "",
  };
};

const resolveOrderAddress = async ({ addressId, address, phone, email, userId }) => {
  if (!addressId && !address)
    return { addressId: null, address: null, phone: phone || null };

  if (addressId && userId) {
    const user = await User.findOne({ email }).select("addresses phone");
    const list = Array.isArray(user?.addresses) ? user.addresses : [];
    const found = list.find((a) => String(a.id) === String(addressId));
    if (found) {
      return {
        addressId: found.id,
        address: snapshotAddress(found, phone),
        phone: phone || found.phone || user?.phone || null,
      };
    }
  }

  if (address) {
    const snapshot = snapshotAddress(address, phone);
    return {
      addressId: address.id || null,
      address: snapshot,
      phone: snapshot?.phone || phone || null,
    };
  }

  return { addressId: null, address: null, phone: phone || null };
};

export const createOrder = async (body, authUser = null) => {
  const { customer, email, channel, table, items, payment, addressId, address, phone } =
    body || {};

  const authEmail = authUser?.email || null;
  const authUserId = authUser?.id || null;

  const finalEmail = (authEmail || email || "").trim().toLowerCase();
  const finalCustomer = customer || authUser?.name;

  if (!finalCustomer || !isValidEmail(finalEmail) || !channel || !Array.isArray(items) || !items.length)
    throw ApiError.badRequest("Invalid order data");

  if (channel === "Delivery" && !addressId && !address)
    throw ApiError.badRequest("A delivery address is required");

  const count = await Order.countDocuments({});
  const orderId = `MT-${4000 + count + 1}`;

  const productDocs = await Product.find({ name: { $in: items } });

  const subtotal = +items
    .reduce((sum, name) => sum + (productDocs.find((p) => p.name === name)?.price || 0), 0)
    .toFixed(2);

  const resolved = await resolveOrderAddress({
    addressId,
    address,
    phone,
    email: finalEmail,
    userId: authUserId,
  });

  const doc = {
    orderId,
    customer: finalCustomer,
    email: finalEmail,
    userId: authUserId,
    channel,
    table: table || null,
    status: "Pending",
    payment: payment || "Card",
    items,
    addressId: resolved.addressId,
    address: resolved.address,
    phone: resolved.phone,
    total: +(subtotal * 1.05).toFixed(2),
    time: new Date(),
  };

  const order = await Order.create(doc);

  await Promise.all(
    items.map((name) =>
      Product.updateOne({ name }, { $inc: { sold: 1 } }).catch(() => null)
    )
  );

  if (authUserId) {
    await Cart.updateOne({ userId: authUserId }, { $set: { items: [] } }).catch(() => null);
  }

  await logActivity(`New order ${orderId} placed by ${finalCustomer} (${finalEmail})`, "gold");

  return { orderId, order: formatOrder(order) };
};

export const listOrders = async (query = {}) => {
  const { status, search } = query;
  const filter = {};
  if (status && status !== "All") filter.status = status;
  if (search) {
    const s = String(search);
    filter.$or = [
      { orderId: { $regex: s, $options: "i" } },
      { customer: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
    ];
  }
  const list = await Order.find(filter).sort({ time: -1 }).limit(200);
  return list.map(formatOrder);
};

export const getMyOrders = async (user) => {
  const query = user.id
    ? { $or: [{ userId: user.id }, { email: user.email }] }
    : { email: user.email };
  const list = await Order.find(query).sort({ time: -1 });
  return list.map(formatOrder);
};

export const getOrdersByEmail = async (email, requester) => {
  if (requester.email !== String(email).toLowerCase() && requester.role !== "admin")
    throw ApiError.forbidden("Not authorized to view these orders");

  const list = await Order.find({
    $or: [{ userId: requester.id }, { email }],
  }).sort({ time: -1 });

  return list.map(formatOrder);
};

export const getOrderHistory = async (email, requester, query = {}) => {
  if (requester.email !== String(email).toLowerCase() && requester.role !== "admin")
    throw ApiError.forbidden("Not authorized to view this history");

  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const filter = {
    $or: [{ userId: requester.id }, { email }],
  };
  if (query.status) filter.status = query.status;

  const list = await Order.find(filter).sort({ time: -1 }).limit(limit);
  return { count: list.length, limit, orders: list.map(formatOrder) };
};

export const getOrderById = async (orderId, requester) => {
  const order = await Order.findOne({ orderId });
  if (!order) throw ApiError.notFound("Order not found");

  const isAdmin = requester.role === "admin";
  const isOwner =
    (order.userId && order.userId === requester.id) ||
    (order.email && order.email.toLowerCase() === requester.email.toLowerCase());

  if (!isAdmin && !isOwner) throw ApiError.forbidden("Not your order");

  return { ...formatOrder(order), email: order.email };
};

export const updateOrder = async (orderId, body) => {
  const update = pick(body, [
    "status",
    "payment",
    "table",
    "customer",
    "channel",
    "items",
    "phone",
    "address",
    "addressId",
  ]);
  if (Object.keys(update).length === 0)
    throw ApiError.badRequest("No fields provided");

  const result = await Order.updateOne({ orderId }, { $set: update });
  if (result.matchedCount === 0) throw ApiError.notFound("Order not found");
  return { message: "Order updated" };
};

export const cancelOrder = async (orderId, requester) => {
  const order = await Order.findOne({ orderId });
  if (!order) throw ApiError.notFound("Order not found");

  const isAdmin = requester.role === "admin";
  const isOwner =
    (order.userId && order.userId === requester.id) ||
    (order.email && order.email.toLowerCase() === requester.email.toLowerCase());

  if (!isAdmin && !isOwner) throw ApiError.forbidden("Not your order");

  if (!["Pending", "Preparing"].includes(order.status))
    throw ApiError.conflict("Order can no longer be cancelled");

  order.status = "Cancelled";
  await order.save();

  await logActivity(`Order ${order.orderId} was cancelled by ${requester.email}`, "danger");

  return { message: "Order cancelled" };
};