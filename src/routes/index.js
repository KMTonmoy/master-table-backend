import { Router } from "express";

import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import productRoutes, { publicProductRouter } from "./product.route.js";
import categoryRoutes from "./category.route.js";
import cartRoutes from "./cart.route.js";
import orderRoutes from "./order.route.js";
import reservationRoutes from "./reservation.route.js";
import dashboardRoutes from "./dashboard.route.js";
import customerRoutes from "./customer.route.js";
import analyticsRoutes from "./analytics.route.js";
import reportRoutes from "./report.route.js";
import paymentRoutes from "./payment.route.js";
import bannerRoutes from "./banner.route.js";
import settingsRoutes from "./settings.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/customers", customerRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reports", reportRoutes);
router.use("/payments", paymentRoutes);
router.use("/banners", bannerRoutes);
router.use("/settings", settingsRoutes);

export { publicProductRouter };

export default router;