import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { Reservation } from "../models/Reservation.js";
import { Activity } from "../models/Activity.js";
import { monthRange, pctDelta, relativeTime, toClient } from "../utils/helpers.js";

export const getSummary = async () => {
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(1);

  const [
    revThis,
    revLast,
    ordThis,
    ordLast,
    custTotal,
    custThis,
    custLast,
    prodTotal,
    lowStock,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { time: { $gte: thisMonth.start, $lte: thisMonth.end } } },
      { $group: { _id: null, sum: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { time: { $gte: lastMonth.start, $lte: lastMonth.end } } },
      { $group: { _id: null, sum: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ time: { $gte: thisMonth.start, $lte: thisMonth.end } }),
    Order.countDocuments({ time: { $gte: lastMonth.start, $lte: lastMonth.end } }),
    Customer.countDocuments({}),
    Customer.countDocuments({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
    Customer.countDocuments({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
    Product.countDocuments({}),
    Product.countDocuments({ status: { $in: ["Low stock", "Out of stock"] } }),
  ]);

  const revenueThis = revThis[0]?.sum || 0;
  const revenueLast = revLast[0]?.sum || 0;

  return {
    revenue: {
      value: Math.round(revenueThis),
      delta: pctDelta(revenueThis, revenueLast),
      trend: revenueThis >= revenueLast ? "up" : "down",
    },
    orders: {
      value: ordThis,
      delta: pctDelta(ordThis, ordLast),
      trend: ordThis >= ordLast ? "up" : "down",
    },
    customers: {
      value: custTotal,
      delta: pctDelta(custThis, custLast),
      trend: custThis >= custLast ? "up" : "down",
      newThisMonth: custThis,
    },
    products: { value: prodTotal, lowStock },
  };
};

const getRevenueRangeConfig = (range) => {
  const now = new Date();

  if (range === "7d") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - 6);
    prevStart.setHours(0, 0, 0, 0);

    return { unit: "day", buckets: 7, start, end, prevStart, prevEnd };
  }

  if (range === "30d") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - 29);
    prevStart.setHours(0, 0, 0, 0);

    return { unit: "day", buckets: 30, start, end, prevStart, prevEnd };
  }

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
  const prevEnd = new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59, 999);
  const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth() - 11, 1, 0, 0, 0, 0);

  return { unit: "month", buckets: 12, start, end, prevStart, prevEnd };
};

const bucketSums = (list, config, rangeStart) => {
  const sums = new Array(config.buckets).fill(0);
  list.forEach((o) => {
    const t = new Date(o.time);
    let diff;
    if (config.unit === "day") {
      diff = Math.floor((t - rangeStart) / 86400000);
    } else {
      diff =
        (t.getFullYear() - rangeStart.getFullYear()) * 12 +
        (t.getMonth() - rangeStart.getMonth());
    }
    if (diff >= 0 && diff < config.buckets) sums[diff] += o.total;
  });
  return sums.map((n) => Math.round(n));
};

const buildLabels = (config, rangeStart) => {
  const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels = [];
  for (let i = 0; i < config.buckets; i++) {
    if (config.unit === "day") {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      labels.push(config.buckets === 7 ? dayShort[d.getDay()] : String(d.getDate()));
    } else {
      const d = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + i, 1);
      labels.push(monthShort[d.getMonth()]);
    }
  }
  return labels;
};

export const getRevenue = async (range = "12m") => {
  if (!["7d", "30d", "12m"].includes(range)) range = "12m";
  const config = getRevenueRangeConfig(range);

  const allOrders = await Order.find({
    time: { $gte: config.prevStart, $lte: config.end },
    status: { $ne: "Cancelled" },
  }).select("total time");

  const current = allOrders.filter((o) => new Date(o.time) >= config.start);
  const previous = allOrders.filter((o) => new Date(o.time) < config.start);

  const data = bucketSums(current, config, config.start);
  const compare = bucketSums(previous, config, config.prevStart);
  const labels = buildLabels(config, config.start);

  const total = data.reduce((a, b) => a + b, 0);
  const prevTotal = compare.reduce((a, b) => a + b, 0);

  return { data, compare, labels, total, delta: pctDelta(total, prevTotal) };
};

export const getDashboardReservations = async (query = {}) => {
  const filter = {};
  if (query.status && query.status !== "All") filter.status = query.status;
  if (query.upcoming === "true") filter.date = { $gte: new Date().toISOString().slice(0, 10) };
  if (query.date) filter.date = query.date;

  const list = await Reservation.find(filter).sort({ date: 1, time: 1, createdAt: 1 });
  return list.map(toClient);
};

export const getRecentActivity = async (limit = 8) => {
  const list = await Activity.find().sort({ _id: -1 }).limit(limit);
  return list.map((a) => ({
    id: a._id.toString(),
    text: a.text,
    tone: a.tone,
    time: a.createdAt ? relativeTime(a.createdAt) : "Just now",
  }));
};