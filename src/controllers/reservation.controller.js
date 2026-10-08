import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import * as reservationService from "../services/reservation.service.js";

export const createReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.createReservation(
    req.body,
    req.user || null
  );
  return created(res, reservation);
});

export const listReservations = asyncHandler(async (req, res) => {
  const list = await reservationService.listReservations(req.query);
  return success(res, list);
});

export const myReservations = asyncHandler(async (req, res) => {
  const list = await reservationService.getMyReservations(req.user);
  return success(res, list);
});

export const reservationsByEmail = asyncHandler(async (req, res) => {
  const list = await reservationService.getReservationsByEmail(
    req.params.email,
    req.user
  );
  return success(res, list);
});

export const reservationHistory = asyncHandler(async (req, res) => {
  const result = await reservationService.getReservationHistory(
    req.params.email,
    req.user,
    req.query
  );
  return success(res, result);
});

export const getReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.getReservationById(
    req.params.id,
    req.user
  );
  return success(res, reservation);
});

export const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.updateReservation(
    req.params.id,
    req.body
  );
  return success(res, reservation);
});

export const deleteReservation = asyncHandler(async (req, res) => {
  const result = await reservationService.deleteReservation(req.params.id);
  return success(res, null, result.message);
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const result = await reservationService.cancelReservation(
    req.params.id,
    req.user
  );
  return success(res, null, result.message);
});