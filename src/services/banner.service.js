import { Banner } from "../models/Banner.js";
import { ApiError } from "../utils/ApiError.js";
import { oid } from "../utils/helpers.js";

export const listBanners = () => Banner.find().sort({ _id: -1 });

export const createBanner = async (body) => {
  const banner = body || {};
  if (!banner.image || !banner.heading || !banner.description)
    throw ApiError.badRequest("Invalid banner data");

  return Banner.create({
    image: banner.image,
    heading: banner.heading,
    description: banner.description,
    timestamp: Date.now(),
  });
};

export const updateBanner = async (id, body) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid banner id");

  const { image, heading, description } = body || {};
  if (!image && !heading && !description)
    throw ApiError.badRequest("No fields provided for update");

  const update = {
    ...(image && { image }),
    ...(heading && { heading }),
    ...(description && { description }),
  };

  const banner = await Banner.findByIdAndUpdate(_id, update, { new: true });
  if (!banner) throw ApiError.notFound("Banner not found");
  return banner;
};

export const deleteBanner = async (id) => {
  const _id = oid(id);
  if (!_id) throw ApiError.badRequest("Invalid banner id");
  const result = await Banner.deleteOne({ _id });
  if (result.deletedCount === 0) throw ApiError.notFound("Banner not found");
  return { message: "Banner deleted successfully" };
};