import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  { _id: false },
);

const hoursSchema = new mongoose.Schema(
  {
    day: { type: String, default: "" },
    open: { type: String, default: "" },
    close: { type: String, default: "" },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);

const settingsSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, default: "Master Table" },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },

    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    mapUrl: { type: String, default: "" },

    currency: { type: String, default: "USD" },
    currencySymbol: { type: String, default: "$" },
    taxRate: { type: Number, default: 5 },
    deliveryFee: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },

    social: { type: socialSchema, default: () => ({}) },
    openingHours: { type: [hoursSchema], default: [] },

    stripeEnabled: { type: Boolean, default: false },
    cashEnabled: { type: Boolean, default: true },
    onlinePaymentEnabled: { type: Boolean, default: false },

    maintenanceMode: { type: Boolean, default: false },
    acceptingOrders: { type: Boolean, default: true },
    acceptingReservations: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false, minimize: false },
);

settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({});
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

export const Settings = mongoose.model("Settings", settingsSchema, "settings");
