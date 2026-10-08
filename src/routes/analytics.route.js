import { Router } from "express";

import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/traffic", analyticsController.traffic);
router.get("/funnel", analyticsController.funnel);
router.get("/weekday-orders", analyticsController.weekdayOrders);
router.get("/heatmap", analyticsController.heatmap);
router.get("/top-dishes", analyticsController.topDishes);

export default router;