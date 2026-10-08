import { toClient } from "./helpers.js";

export const formatOrderTime = (time) =>
  new Date(time).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });

export const formatOrder = (o) => ({
  id: o.orderId,
  customer: o.customer,
  email: o.email || null,
  userId: o.userId ? String(o.userId) : null,
  channel: o.channel,
  table: o.table,
  status: o.status,
  payment: o.payment,
  items: o.items,
  addressId: o.addressId || null,
  address: o.address || null,
  phone: o.phone || null,
  total: +Number(o.total || 0).toFixed(2),
  time: formatOrderTime(o.time),
  rawTime: o.time,
});

export const formatOrderFull = (o) => ({
  ...formatOrder(o),
  email: o.email,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
  _id: o._id?.toString(),
});

export const toSearchResult = (doc) => {
  const clean = toClient(doc);
  return { ...clean, _id: clean.id };
};