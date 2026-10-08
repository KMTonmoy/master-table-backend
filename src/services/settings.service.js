import { Settings } from "../models/Settings.js";
import { toClient } from "../utils/helpers.js";

export const getSettings = async () => {
  const doc = await Settings.getSingleton();
  return toClient(doc);
};

export const updateSettings = async (body) => {
  const payload = { ...(body || {}) };
  delete payload._id;
  delete payload.id;
  delete payload.createdAt;

  const existing = await Settings.findOne({});

  if (!existing) {
    const created = await Settings.create(payload);
    return toClient(created);
  }

  const updated = await Settings.findByIdAndUpdate(
    existing._id,
    { $set: payload },
    { new: true, runValidators: true }
  );

  return toClient(updated);
};