import { Router } from "express";

import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/summary", dashboardController.summary);
router.get("/revenue", dashboardController.revenue);
router.get("/reservations", dashboardController.reservations);
router.get("/activity", dashboardController.activity);

export default router;