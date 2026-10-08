import { Router } from "express";

import * as bannerController from "../controllers/banner.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createBannerSchema,
  updateBannerSchema,
} from "../validations/banner.validation.js";

const router = Router();

router.get("/", bannerController.listBanners);
router.post("/", authenticate, requireAdmin, validate(createBannerSchema), bannerController.createBanner);
router.patch("/:id", authenticate, requireAdmin, validate(updateBannerSchema), bannerController.updateBanner);
router.put("/:id", authenticate, requireAdmin, validate(updateBannerSchema), bannerController.updateBanner);
router.delete("/:id", authenticate, requireAdmin, bannerController.deleteBanner);

export default router;