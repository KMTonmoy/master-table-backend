import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { Types } from "mongoose";

export const getAllUsers = () =>
  User.find()
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .sort({ createdAt: -1 });

export const getUserById = async (id) => {
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user id");
  const user = await User.findById(id).select(
    "-password -resetPasswordToken -resetPasswordExpires"
  );
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

export const createUserAsAdmin = async ({ name, email, password, role }) => {
  if (!email) throw ApiError.badRequest("Email is required");
  if (!["user", "admin"].includes(role))
    throw ApiError.badRequest("Role must be 'user' or 'admin'");

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({
    name: (name || "").trim(),
    email: normalizedEmail,
    password: password || null,
    role,
    isVerified: true,
    provider: "email",
  });

  return user.toSafeJSON();
};

export const updateUserRole = async (id, role) => {
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user id");
  if (!["user", "admin"].includes(role))
    throw ApiError.badRequest("Role must be 'user' or 'admin'");

  const target = await User.findById(id);
  if (!target) throw ApiError.notFound("User not found");

  if (target.role === "admin" && role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1)
      throw ApiError.badRequest("Cannot remove the last remaining admin");
  }

  target.role = role;
  await target.save();
  return { message: "Role updated successfully" };
};

export const deleteUser = async (id) => {
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user id");

  const target = await User.findById(id);
  if (!target) throw ApiError.notFound("User not found");

  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1)
      throw ApiError.badRequest("Cannot delete the last remaining admin");
  }

  await target.deleteOne();
  return { message: "User deleted successfully" };
};

export const updateMe = async (userId, { name, profileImage, phone }) => {
  const update = {};
  if (typeof name === "string" && name.trim().length >= 2) update.name = name.trim();
  if (typeof profileImage === "string") update.profileImage = profileImage.trim();
  if (typeof phone === "string") update.phone = phone.trim();

  if (Object.keys(update).length === 0)
    throw ApiError.badRequest("No fields provided");

  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound("User not found");
  return user.toSafeJSON();
};

export const listAddresses = async (userId) => {
  const user = await User.findById(userId).select("addresses phone defaultAddressId");
  if (!user) throw ApiError.notFound("User not found");
  return {
    addresses: Array.isArray(user.addresses) ? user.addresses : [],
    phone: user.phone || "",
    defaultAddressId: user.defaultAddressId || null,
  };
};

const normalizeAddressInput = (body) => ({
  label: typeof body.label === "string" ? body.label.trim() : "",
  line1: typeof body.line1 === "string" ? body.line1.trim() : "",
  line2: typeof body.line2 === "string" ? body.line2.trim() : "",
  city: typeof body.city === "string" ? body.city.trim() : "",
  postalCode: typeof body.postalCode === "string" ? body.postalCode.trim() : "",
  country: typeof body.country === "string" ? body.country.trim() : "",
  phone: typeof body.phone === "string" ? body.phone.trim() : "",
});

const validateAddress = (address) => {
  if (!address.line1) return "Address line 1 is required";
  if (!address.city) return "City is required";
  if (!address.phone) return "Phone number is required";
  if (address.phone.length < 5) return "Phone number is too short";
  return null;
};

export const addAddress = async (userId, body) => {
  const input = normalizeAddressInput(body);
  const err = validateAddress(input);
  if (err) throw ApiError.badRequest(err);

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const existing = Array.isArray(user.addresses) ? user.addresses : [];
  if (existing.length >= 7) throw ApiError.badRequest("You can save up to 7 addresses");

  const address = {
    id: new Types.ObjectId().toString(),
    label: input.label || `Address ${existing.length + 1}`,
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    postalCode: input.postalCode,
    country: input.country,
    phone: input.phone,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const shouldBeDefault = body?.isDefault === true || existing.length === 0;

  user.addresses.push(address);
  if (shouldBeDefault) user.defaultAddressId = address.id;
  if (!user.phone && address.phone) user.phone = address.phone;

  await user.save();
  return address;
};

export const updateAddress = async (userId, addressId, body) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const list = Array.isArray(user.addresses) ? user.addresses : [];
  const idx = list.findIndex((a) => String(a.id) === String(addressId));
  if (idx < 0) throw ApiError.notFound("Address not found");

  const merged = normalizeAddressInput({ ...list[idx].toObject?.() ?? list[idx], ...body });
  const err = validateAddress(merged);
  if (err) throw ApiError.badRequest(err);

  list[idx].label = merged.label || list[idx].label;
  list[idx].line1 = merged.line1;
  list[idx].line2 = merged.line2;
  list[idx].city = merged.city;
  list[idx].postalCode = merged.postalCode;
  list[idx].country = merged.country;
  list[idx].phone = merged.phone;
  list[idx].updatedAt = new Date();

  if (body?.isDefault === true) user.defaultAddressId = addressId;

  await user.save();
  return list[idx];
};

export const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const list = (Array.isArray(user.addresses) ? user.addresses : []).filter(
    (a) => String(a.id) !== String(addressId)
  );

  user.addresses = list;
  if (String(user.defaultAddressId || "") === String(addressId)) {
    user.defaultAddressId = list[0]?.id || null;
  }

  await user.save();
  return { message: "Address removed" };
};

export const setDefaultAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const found = (user.addresses || []).find(
    (a) => String(a.id) === String(addressId)
  );
  if (!found) throw ApiError.notFound("Address not found");

  user.defaultAddressId = addressId;
  if (found.phone) user.phone = found.phone;
  await user.save();

  return { defaultAddressId: addressId };
};

export const updatePhone = async (userId, phone) => {
  if (typeof phone !== "string" || phone.trim().length < 5)
    throw ApiError.badRequest("A valid phone number is required");

  const user = await User.findByIdAndUpdate(
    userId,
    { phone: phone.trim() },
    { new: true }
  );
  if (!user) throw ApiError.notFound("User not found");
  return { phone: user.phone };
};