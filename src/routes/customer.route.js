import { Router } from "express";

import * as customerController from "../controllers/customer.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCustomerSchema } from "../validations/customer.validation.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", customerController.listCustomers);
router.post("/", validate(createCustomerSchema), customerController.createCustomer);

export default router;