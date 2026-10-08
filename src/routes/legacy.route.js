import { Router } from "express";

import * as productController from "../controllers/product.controller.js";
import * as orderController from "../controllers/order.controller.js";
import * as reservationController from "../controllers/reservation.controller.js";
import * as paymentController from "../controllers/payment.controller.js";
import * as bannerController from "../controllers/banner.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { optionalAuthenticate } from "../middlewares/optionalAuth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createPublicProductSchema,
  updateProductSchema,
  replaceProductSchema,
} from "../validations/product.validation.js";

import {
  createOrderSchema,
} from "../validations/order.validation.js";

import {
  createReservationSchema,
} from "../validations/reservation.validation.js";

import {
  createPaymentIntentSchema,
  createPaymentSchema,
} from "../validations/payment.validation.js";

import {
  createBannerSchema,
  updateBannerSchema,
} from "../validations/banner.validation.js";

export const legacyProductRouter = Router();

legacyProductRouter.get("/", productController.listPublicProducts);
legacyProductRouter.get("/keyword", productController.keywordProducts);
legacyProductRouter.get("/:id", productController.getProduct);
legacyProductRouter.post("/", authenticate, requireAdmin, validate(createPublicProductSchema), productController.createPublicProduct);
legacyProductRouter.patch("/:id", authenticate, requireAdmin, validate(updateProductSchema), productController.updateProduct);
legacyProductRouter.put("/:id", authenticate, requireAdmin, validate(replaceProductSchema), productController.replaceProduct);
legacyProductRouter.delete("/:id", authenticate, requireAdmin, productController.deleteProduct);

export const legacyOrderRouter = Router();
legacyOrderRouter.post("/", optionalAuthenticate, validate(createOrderSchema), orderController.createOrder);
legacyOrderRouter.get("/my-orders", authenticate, orderController.myOrders);
legacyOrderRouter.get("/my-orders/:email", authenticate, orderController.ordersByEmail);
legacyOrderRouter.get("/history/:email", authenticate, orderController.orderHistory);
legacyOrderRouter.get("/:orderId", authenticate, orderController.getOrder);
legacyOrderRouter.patch("/:orderId/cancel", authenticate, orderController.cancelOrder);

export const legacyReservationRouter = Router();
legacyReservationRouter.post("/", optionalAuthenticate, validate(createReservationSchema), reservationController.createReservation);
legacyReservationRouter.get("/my-reservations", authenticate, reservationController.myReservations);
legacyReservationRouter.get("/my-reservations/:email", authenticate, reservationController.reservationsByEmail);
legacyReservationRouter.get("/history/:email", authenticate, reservationController.reservationHistory);
legacyReservationRouter.get("/:id", authenticate, reservationController.getReservation);
legacyReservationRouter.patch("/:id/cancel", authenticate, reservationController.cancelReservation);

export const legacyPaymentRouter = Router();
legacyPaymentRouter.post("/create-payment-intent", validate(createPaymentIntentSchema), paymentController.createPaymentIntent);
legacyPaymentRouter.get("/", authenticate, requireAdmin, paymentController.listPayments);
legacyPaymentRouter.get("/:email", authenticate, paymentController.paymentsByEmail);
legacyPaymentRouter.post("/", optionalAuthenticate, validate(createPaymentSchema), paymentController.createPayment);

export const legacyBannerRouter = Router();
legacyBannerRouter.get("/", bannerController.listBanners);
legacyBannerRouter.post("/", authenticate, requireAdmin, validate(createBannerSchema), bannerController.createBanner);
legacyBannerRouter.patch("/:id", authenticate, requireAdmin, validate(updateBannerSchema), bannerController.updateBanner);
legacyBannerRouter.put("/:id", authenticate, requireAdmin, validate(updateBannerSchema), bannerController.updateBanner);
legacyBannerRouter.delete("/:id", authenticate, requireAdmin, bannerController.deleteBanner);

export const legacyUserRouter = Router();

export const legacyLogoutRouter = Router();
legacyLogoutRouter.get("/", (req, res) => {
  res
    .clearCookie("token", {
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});