import { Router } from "express";

import * as reservationController from "../controllers/reservation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { optionalAuthenticate } from "../middlewares/optionalAuth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createReservationSchema,
  updateReservationSchema,
} from "../validations/reservation.validation.js";

const router = Router();

router.get("/", authenticate, requireAdmin, reservationController.listReservations);
router.post("/", optionalAuthenticate, validate(createReservationSchema), reservationController.createReservation);

router.get("/my-reservations", authenticate, reservationController.myReservations);
router.get("/my-reservations/:email", authenticate, reservationController.reservationsByEmail);
router.get("/history/:email", authenticate, reservationController.reservationHistory);
router.get("/:id", authenticate, reservationController.getReservation);

router.patch("/:id", authenticate, requireAdmin, validate(updateReservationSchema), reservationController.updateReservation);
router.patch("/:id/cancel", authenticate, reservationController.cancelReservation);
router.delete("/:id", authenticate, requireAdmin, reservationController.deleteReservation);

export const legacyReservationRouter = Router();
legacyReservationRouter.post("/", optionalAuthenticate, validate(createReservationSchema), reservationController.createReservation);
legacyReservationRouter.get("/my-reservations", authenticate, reservationController.myReservations);
legacyReservationRouter.get("/my-reservations/:email", authenticate, reservationController.reservationsByEmail);
legacyReservationRouter.get("/history/:email", authenticate, reservationController.reservationHistory);
legacyReservationRouter.get("/:id", authenticate, reservationController.getReservation);
legacyReservationRouter.patch("/:id/cancel", authenticate, reservationController.cancelReservation);

export default router;