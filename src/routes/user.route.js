import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  updateMeSchema,
  createUserSchema,
  updateRoleSchema,
  updatePhoneSchema,
} from "../validations/user.validation.js";

import {
  addressInputSchema,
  addressUpdateSchema,
} from "../validations/address.validation.js";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMe);
router.patch("/me", validate(updateMeSchema), userController.updateMe);
router.patch("/me/phone", validate(updatePhoneSchema), userController.updatePhone);

router.get("/me/addresses", userController.listAddresses);
router.post("/me/addresses", validate(addressInputSchema), userController.addAddress);
router.patch("/me/addresses/:id", validate(addressUpdateSchema), userController.updateAddress);
router.delete("/me/addresses/:id", userController.removeAddress);
router.patch("/me/addresses/:id/default", userController.setDefaultAddress);

router.get("/", requireAdmin, userController.listUsers);
router.post("/", requireAdmin, validate(createUserSchema), userController.createUser);
router.get("/:id", requireAdmin, userController.getUser);
router.patch("/:id/role", requireAdmin, validate(updateRoleSchema), userController.updateRole);
router.delete("/:id", requireAdmin, userController.removeUser);

export default router;