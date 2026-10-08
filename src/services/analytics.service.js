import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Analytics } from "../models/Analytics.js";

const since90 = () => {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d;
};

export const getTrafficSources = async () => {
  const doc = await Analytics.findOne({ key: "traffic-sources" });
  return doc?.segments || [];
};

export const getFunnel = async () => {
  const doc = await Analytics.findOne({ key: "funnel" });
  return doc?.steps || [];
};

export const getWeekdayOrders = async () => {
  const list = await Order.find({ time: { $gte: since90() } }).select("time");
  const counts = new Array(7).fill(0);
  list.forEach((o) => (counts[new Date(o.time).getDay()] += 1));
  return [counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]];
};

export const getHeatmap = async () => {
  const list = await Order.find({ time: { $gte: since90() } }).select("time");
  const hours = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const grid = Array.from({ length: 7 }, () => new Array(hours.length).fill(0));

  list.forEach((o) => {
    const d = new Date(o.time);
    const dow = (d.getDay() + 6) % 7;
    const hIdx = hours.indexOf(d.getHours());
    if (hIdx >= 0) grid[dow][hIdx] += 1;
  });

  return { hours, grid };
};

export const getTopDishes = async (limit = 5) => {
  const list = await Product.find().sort({ sold: -1 }).limit(limit);
  const maxSold = list.reduce((m, p) => Math.max(m, p.sold || 0), 0) || 1;
  return list.map((p) => ({
    name: p.name,
    image: (p.images && p.images[0]) || "",
    sold: p.sold || 0,
    share: Math.round(((p.sold || 0) / maxSold) * 100),
  }));
};