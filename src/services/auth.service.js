import crypto from "crypto";

import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { isValidEmail } from "../utils/helpers.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
import { clientOrigin } from "../utils/helpers.js";

export const registerUser = async ({ name, email, password }) => {
  if (!name || typeof name !== "string" || name.trim().length < 2)
    throw ApiError.badRequest("A valid name is required");

  if (!isValidEmail(email))
    throw ApiError.badRequest("A valid email is required");

  if (!password || typeof password !== "string" || password.length < 6)
    throw ApiError.badRequest("Password must be at least 6 characters");

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    provider: "email",
    role: "user",
    isVerified: false,
    addresses: [],
    defaultAddressId: null,
    profileImage: "",
    phone: "",
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return { user: user.toSafeJSON(), token };
};

export const loginUser = async ({ email, password }) => {
  if (!isValidEmail(email) || !password)
    throw ApiError.badRequest("Email and password are required");

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) throw ApiError.unauthorized("Invalid email or password");

  if (!user.password)
    throw ApiError.badRequest(
      `This account uses ${user.provider || "social"} sign-in. Please continue with ${user.provider || "your social provider"}.`
    );

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return { user: user.toSafeJSON(), token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user.toSafeJSON();
};

export const requestPasswordReset = async (email) => {
  if (!isValidEmail(email)) throw ApiError.badRequest("A valid email is required");

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && user.provider === "email") {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${clientOrigin()}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (e) {
      console.error("Failed to send reset email:", e.message);
    }
  }

  return {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };
};

export const resetPassword = async (rawToken, newPassword) => {
  if (!newPassword || newPassword.length < 6)
    throw ApiError.badRequest("Password must be at least 6 characters");

  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) throw ApiError.badRequest("Invalid or expired reset link");

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return { message: "Password has been reset. You can now log in." };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword)
    throw ApiError.badRequest("Current and new password are required");

  if (newPassword.length < 8)
    throw ApiError.badRequest("New password must be at least 8 characters");

  if (currentPassword === newPassword)
    throw ApiError.badRequest("New password must be different");

  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  if (!user.password)
    throw ApiError.badRequest(
      `This account signs in with ${user.provider}. Use "Forgot password" to set one.`
    );

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw ApiError.unauthorized("Current password is incorrect");

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};