import { Router } from "express";

import * as orderController from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { optionalAuthenticate } from "../middlewares/optionalAuth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createOrderSchema,
  updateOrderSchema,
} from "../validations/order.validation.js";

const router = Router();

router.get("/", authenticate, requireAdmin, orderController.listOrders);
router.post("/", optionalAuthenticate, validate(createOrderSchema), orderController.createOrder);

router.get("/my-orders", authenticate, orderController.myOrders);
router.get("/my-orders/:email", authenticate, orderController.ordersByEmail);
router.get("/history/:email", authenticate, orderController.orderHistory);
router.get("/:orderId", authenticate, orderController.getOrder);

router.patch("/:orderId", authenticate, requireAdmin, validate(updateOrderSchema), orderController.updateOrder);
router.patch("/:orderId/cancel", authenticate, orderController.cancelOrder);

export const legacyOrderRouter = Router();
legacyOrderRouter.post("/", optionalAuthenticate, validate(createOrderSchema), orderController.createOrder);
legacyOrderRouter.get("/my-orders", authenticate, orderController.myOrders);
legacyOrderRouter.get("/my-orders/:email", authenticate, orderController.ordersByEmail);
legacyOrderRouter.get("/history/:email", authenticate, orderController.orderHistory);
legacyOrderRouter.get("/:orderId", authenticate, orderController.getOrder);
legacyOrderRouter.patch("/:orderId/cancel", authenticate, orderController.cancelOrder);

export default router;