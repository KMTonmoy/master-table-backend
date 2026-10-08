import { Router } from "express";

import * as categoryController from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation.js";

const router = Router();

router.get("/", categoryController.listCategories);
router.get("/:id", categoryController.getCategory);
router.post("/", authenticate, requireAdmin, validate(createCategorySchema), categoryController.createCategory);
router.patch("/:id", authenticate, requireAdmin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", authenticate, requireAdmin, categoryController.deleteCategory);

export default router;