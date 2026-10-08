import { Router } from "express";

import * as paymentController from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { optionalAuthenticate } from "../middlewares/optionalAuth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createPaymentIntentSchema,
  createPaymentSchema,
} from "../validations/payment.validation.js";

const router = Router();

router.post(
  "/create-payment-intent",
  validate(createPaymentIntentSchema),
  paymentController.createPaymentIntent
);

router.get("/", authenticate, requireAdmin, paymentController.listPayments);
router.get("/:email", authenticate, paymentController.paymentsByEmail);
router.post("/", optionalAuthenticate, validate(createPaymentSchema), paymentController.createPayment);

export default router;