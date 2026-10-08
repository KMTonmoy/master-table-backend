import { Types } from "mongoose";

export const oid = (id) =>
  Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;

export const pick = (obj, keys) => {
  const out = {};
  if (!obj) return out;
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

export const omit = (obj, keys) => {
  const out = { ...(obj || {}) };
  keys.forEach((k) => delete out[k]);
  return out;
};

export const toClient = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, password, resetPasswordToken, resetPasswordExpires, ...rest } = obj;
  return { id: _id?.toString(), ...rest };
};

export const toClientSafe = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { id: _id?.toString(), ...rest };
};

export const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const pctDelta = (current, previous) => {
  if (!previous) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

export const monthRange = (offset = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() - offset + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
};

export const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => (typeof img === "string" ? img.trim() : ""))
    .filter(Boolean);
};

export const normalizeStringArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
};

export const relativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const clientOrigin = () =>
  (process.env.CLIENT_ORIGIN || "http://localhost:3000").replace(/\/+$/, "");

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const parsePagination = (query, defaults = { page: 1, limit: 20, maxLimit: 100 }) => {
  const page = Math.max(1, parseInt(query.page, 10) || defaults.page);
  const limit = clamp(
    parseInt(query.limit, 10) || defaults.limit,
    1,
    defaults.maxLimit
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const randomHex = (bytes = 32) =>
  import("crypto").then(({ randomBytes }) => randomBytes(bytes).toString("hex"));