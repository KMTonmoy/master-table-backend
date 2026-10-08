import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { ApiError } from "../utils/ApiError.js";
import { toClient } from "../utils/helpers.js";
import { tierFor } from "../constants/status.js";
export const listCustomers = async (query = {}) => {
  const { tier, search } = query;

  const baseQuery = {};
  if (search) {
    const s = String(search);
    baseQuery.$or = [
      { name: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
      { city: { $regex: s, $options: "i" } },
    ];
  }

  const list = await Customer.find(baseQuery);

  const agg = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { $toLower: "$email" },
        orders: { $sum: 1 },
        spent: { $sum: "$total" },
        lastTime: { $max: "$time" },
      },
    },
  ]);
  const byEmail = new Map(agg.map((a) => [a._id, a]));

  const enriched = list.map((c) => {
    const a = byEmail.get((c.email || "").toLowerCase());
    const spent = Number(a?.spent || 0);
    return {
      ...toClient(c),
      orders: a?.orders || 0,
      spent: +spent.toFixed(2),
      tier: tierFor(spent),
      lastVisit: a?.lastTime
        ? new Date(a.lastTime).toISOString().slice(0, 10)
        : c.lastVisit || "",
    };
  });

  const filtered =
    tier && tier !== "All" ? enriched.filter((c) => c.tier === tier) : enriched;

  return filtered.sort((a, b) => b.spent - a.spent);
};

export const createCustomer = async (body) => {
  const { name, email, city } = body || {};
  if (!name || !email) throw ApiError.badRequest("Name and email required");

  return Customer.create({
    name,
    email: email.trim().toLowerCase(),
    city: city || "",
    orders: 0,
    spent: 0,
    tier: "Regular",
    lastVisit: new Date().toISOString().slice(0, 10),
  });
};
