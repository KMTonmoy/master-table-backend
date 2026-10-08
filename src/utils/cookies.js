import { isProd } from "../config/env.js";

const COOKIE_NAME = "token";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "strict",
  maxAge: MAX_AGE,
  path: "/",
});

export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "strict",
  path: "/",
});

export const setAuthCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, getCookieOptions());

export const clearAuthCookie = (res) =>
  res.clearCookie(COOKIE_NAME, getClearCookieOptions());

export const COOKIE_NAME_EXPORT = COOKIE_NAME;