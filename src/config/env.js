import dotenv from "dotenv";

dotenv.config({ quiet: true });

const toBool = (v, fallback = false) => {
  if (v === undefined) return fallback;
  return String(v).toLowerCase() === "true";
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 8000,

  DB_URI:
    process.env.DB_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "",

  JWT_SECRET: process.env.JWT_SECRET || "change-me-in-env",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  CLIENT_ORIGIN: (process.env.CLIENT_ORIGIN || "http://localhost:3000").replace(
    /\/+$/,
    "",
  ),

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:8000/api/auth/google/callback",

  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || "",
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || "",
  FACEBOOK_CALLBACK_URL:
    process.env.FACEBOOK_CALLBACK_URL ||
    "http://localhost:8000/api/auth/facebook/callback",

  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: toBool(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "Master Table <no-reply@mastertable.app>",

  IS_VERCEL: Boolean(process.env.VERCEL),
};

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
