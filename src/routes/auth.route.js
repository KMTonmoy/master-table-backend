import { Router } from "express";
import passport from "passport";

import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../utils/rateLimit.js";
import { hasStrategy } from "../config/passport.js";
import { env } from "../config/env.js";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validations/auth.validation.js";

const router = Router();
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

const requireStrategy = (name) => (req, res, next) => {
  if (!hasStrategy(name)) {
    return res.status(501).json({
      success: false,
      message: `${name} sign-in is not configured on this server.`,
    });
  }
  next();
};

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
router.post("/logout", authController.logout);

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password/:token",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  "/change-password",
  authenticate,
  authLimiter,
  validate(changePasswordSchema),
  authController.changePassword
);

router.get(
  "/google",
  requireStrategy("google"),
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  requireStrategy("google"),
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.CLIENT_ORIGIN}/?authError=google`,
  }),
  authController.googleCallback
);

router.get(
  "/facebook",
  requireStrategy("facebook"),
  passport.authenticate("facebook", { scope: ["email"], session: false })
);
router.get(
  "/facebook/callback",
  requireStrategy("facebook"),
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${env.CLIENT_ORIGIN}/?authError=facebook`,
  }),
  authController.facebookCallback
);

export default router;