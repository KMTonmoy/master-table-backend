import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "passport";

import { env, isProd } from "./config/env.js";
import { configurePassport, hasStrategy } from "./config/passport.js";

import apiRoutes from "./routes/index.js";
import {
  legacyProductRouter,
  legacyOrderRouter,
  legacyReservationRouter,
  legacyPaymentRouter,
  legacyBannerRouter,
  legacyLogoutRouter,
} from "./routes/legacy.route.js";

import { dbReady } from "./middlewares/dbReady.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",
  env.CLIENT_ORIGIN,
  "https://mastertable.vercel.app",
  "https://master-table-server.vercel.app",
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

if (!isProd) app.use(morgan("dev"));

configurePassport();

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Master Table API",
    message: "Server is running. This is a backend — nothing to see here 👋",
    docs: "/api",
    health: "/health",
    env: env.NODE_ENV,
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    env: env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    dbConfigured: Boolean(env.DB_URI),
    stripeConfigured: Boolean(env.STRIPE_SECRET_KEY),
    clientOriginConfigured: Boolean(env.CLIENT_ORIGIN),
    googleOAuth: hasStrategy("google"),
    facebookOAuth: hasStrategy("facebook"),
  });
});

app.use(dbReady);

app.use("/api", apiRoutes);

app.use("/products", legacyProductRouter);
app.use("/orders", legacyOrderRouter);
app.use("/reservations", legacyReservationRouter);
app.use("/payments", legacyPaymentRouter);
app.use("/banners", legacyBannerRouter);
app.use("/logout", legacyLogoutRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
