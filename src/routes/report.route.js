import { Router } from "express";

import * as reportController from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { generateReportSchema } from "../validations/report.validation.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", reportController.listReports);
router.post("/generate", validate(generateReportSchema), reportController.generateReport);
router.get("/:id/download", reportController.downloadReport);
router.delete("/:id", reportController.deleteReport);
router.delete("/", reportController.deleteAllReports);

export default router;