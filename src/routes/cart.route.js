import { Router } from "express";

import * as cartController from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../validations/cart.validation.js";

const router = Router();

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", validate(addCartItemSchema), cartController.addItem);
router.patch("/items/:productId", validate(updateCartItemSchema), cartController.updateItem);
router.delete("/", cartController.clearCart);

export default router;