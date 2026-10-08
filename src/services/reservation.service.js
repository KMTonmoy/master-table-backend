import { Reservation } from "../models/Reservation.js";
import { Activity } from "../models/Activity.js";
import { ApiError } from "../utils/ApiError.js";
import { oid, pick, isValidEmail, toClient } from "../utils/helpers.js";

const logActivity = async (text, tone = "gold") => {
  try {
    await Activity.create({ text, tone, createdAt: new Date() });
  } catch (e) {
    console.error("activity log failed:", e.message);
  }
};

export const createReservation = async (body, authUser = null) => {
  const { name, email, phone, date, time, guests, occasion, notes } = body || {};

  const finalEmail = authUser?.email || email;
  const finalName = name || authUser?.name;

  if (!finalName || typeof finalName !== "string" || finalName.trim().length < 2)
    throw ApiError.badRequest("A valid name is required");

  if (!isValidEmail(finalEmail))
    throw ApiError.badRequest("A valid email is required");

  if (!phone || typeof phone !== "string" || phone.trim().length < 5)
    throw ApiError.badRequest("A valid phone number is required");

  if (!date || !time) throw ApiError.badRequest("Date and time are required");

  const guestCount = Number(guests);
  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 50)
    throw ApiError.badRequest("Guests must be a number between 1 and 50");

  const reservation = await Reservation.create({
    name: finalName.trim(),
    email: finalEmail.trim().toLowerCase(),
    userId: authUser?.id || null,
    phone: phone.trim(),
    date,
    time,
    guests: guestCount,
    occasion: occasion || "",
    notes: notes || "",
    status: "Pending",
    table: null,
  });

  await logActivity(`New reservation for ${finalName} on ${date} at ${time}`, "gold");

  return toClient(reservation);
};

export const listReservations = async (query = {}) => {
  const { status, search, date, upcoming } = query;
  const filter = {};

  if (status && status !== "All") filter.status = status;
  if (date) filter.date = date;
  if (upcoming === "true")
    filter.date = { $gte: new Date().toISOString().slice(0, 10) };

  if (search) {
    const s = String(search);
    filter.$or = [
      { name: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
      { phone: { $regex: s, $options: "i" } },
    ];
  }

  const list = await Reservation.find(filter).sort({ date: 1, time: 1, createdAt: 1 });
  return list.map(toClient);
};

export const getMyReservations = async (user) => {
  const limit = 100;
  const list = await Reservation.find({
    $or: [{ userId: user.id }, { email: user.email }],
  })
    .sort({ date: 1, time: 1 })
    .limit(limit);
  return list.map(toClient);
};

export const getReservationsByEmail = async (email, requester) => {
  if (requester.email !== String(email).toLowerCase() && requester.role !== "admin")
    throw ApiError.forbidden("Not authorized");

  const list = await Reservation.find({
    $or: [{ userId: requester.id }, { email }],
  }).sort({ date: 1, time: 1 });

  return list.map(toClient);
};

export const getReservationHistory = async (email, requester, query = {}) => {
  if (requester.email !== String(email).toLowerCase() && requester.role !== "admin")
    throw ApiError.forbidden("Not authorized");

  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const filter = {
    $or: [{ userId: requester.id }, { email }],
  };
  if (query.status) filter.status = query.status;

  const list = await Reservation.find(filter).sort({ createdAt: -1 }).limit(limit);
  return { count: list.length, limit, reservations: list.map(toClient) };
};

export const getReservationById = async (id, requester) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid reservation id");

  const reservation = await Reservation.findById(_id);
  if (!reservation) throw ApiError.notFound("Reservation not found");

  const isAdmin = requester.role === "admin";
  const isOwner =
    (reservation.userId && reservation.userId === requester.id) ||
    (reservation.email && reservation.email.toLowerCase() === requester.email.toLowerCase());

  if (!isAdmin && !isOwner) throw ApiError.forbidden("Not your reservation");

  return toClient(reservation);
};

export const updateReservation = async (id, body) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid reservation id");

  const update = pick(body, [
    "name",
    "email",
    "phone",
    "date",
    "time",
    "guests",
    "occasion",
    "notes",
    "status",
    "table",
  ]);
  if (update.guests !== undefined) update.guests = Number(update.guests);

  if (Object.keys(update).length === 0)
    throw ApiError.badRequest("No fields provided");

  const reservation = await Reservation.findByIdAndUpdate(_id, update, {
    new: true,
    runValidators: true,
  });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  return toClient(reservation);
};

export const deleteReservation = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid reservation id");
  const result = await Reservation.deleteOne({ _id });
  if (result.deletedCount === 0) throw ApiError.notFound("Reservation not found");
  return { message: "Reservation deleted" };
};

export const cancelReservation = async (id, requester) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid reservation id");

  const reservation = await Reservation.findById(_id);
  if (!reservation) throw ApiError.notFound("Reservation not found");

  const isAdmin = requester.role === "admin";
  const isOwner =
    (reservation.userId && reservation.userId === requester.id) ||
    (reservation.email && reservation.email.toLowerCase() === requester.email.toLowerCase());

  if (!isAdmin && !isOwner) throw ApiError.forbidden("Not your reservation");

  if (!["Confirmed", "Pending"].includes(reservation.status))
    throw ApiError.conflict("Reservation can no longer be cancelled");

  reservation.status = "Cancelled";
  await reservation.save();

  await logActivity(
    `Reservation for ${reservation.name} on ${reservation.date} was cancelled`,
    "danger"
  );

  return { message: "Reservation cancelled" };
};