import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema, "BannerCollection");