import { Router } from "express";

import * as settingsController from "../controllers/settings.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", settingsController.getSettings);
router.patch("/", authenticate, requireAdmin, settingsController.updateSettings);

export default router;