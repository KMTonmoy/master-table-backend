import { Router } from "express";

import * as productController from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
  replaceProductSchema,
  createPublicProductSchema,
} from "../validations/product.validation.js";

const router = Router();

router.get("/", productController.listProducts);
router.get("/keyword", productController.keywordProducts);
router.get("/:id", productController.getProduct);

router.post("/", authenticate, requireAdmin, validate(createProductSchema), productController.createProduct);
router.patch("/:id", authenticate, requireAdmin, validate(updateProductSchema), productController.updateProduct);
router.put("/:id", authenticate, requireAdmin, validate(replaceProductSchema), productController.replaceProduct);
router.delete("/:id", authenticate, requireAdmin, productController.deleteProduct);

export const publicProductRouter = Router();
publicProductRouter.get("/", productController.listPublicProducts);
publicProductRouter.get("/keyword", productController.keywordProducts);
publicProductRouter.get("/:id", productController.getProduct);
publicProductRouter.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createPublicProductSchema),
  productController.createPublicProduct
);
publicProductRouter.patch("/:id", authenticate, requireAdmin, validate(updateProductSchema), productController.updateProduct);
publicProductRouter.put("/:id", authenticate, requireAdmin, validate(replaceProductSchema), productController.replaceProduct);
publicProductRouter.delete("/:id", authenticate, requireAdmin, productController.deleteProduct);

export default router;