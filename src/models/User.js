import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, ROLE_VALUES } from "../constants/roles.js";

const addressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: "" },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, default: null, select: false },
    profileImage: { type: String, default: "" },
    phone: { type: String, default: "" },
    addresses: { type: [addressSchema], default: [] },
    defaultAddressId: { type: String, default: null },
    provider: { type: String, default: "email" },
    providerId: { type: String, default: null },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.USER },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    profileImage: this.profileImage || "",
    role: this.role || "user",
    provider: this.provider || "email",
    isVerified: this.isVerified === true,
    phone: this.phone || "",
    addresses: Array.isArray(this.addresses) ? this.addresses : [],
    defaultAddressId: this.defaultAddressId || null,
  };
};

export const User = mongoose.model("User", userSchema, "users");