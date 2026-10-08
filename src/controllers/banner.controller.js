import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { toClient } from "../utils/helpers.js";
import * as bannerService from "../services/banner.service.js";

export const listBanners = asyncHandler(async (req, res) => {
  const list = await bannerService.listBanners();
  return success(res, list.map(toClient));
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.createBanner(req.body);
  return created(res, {
    message: "Banner uploaded successfully",
    banner: toClient(banner),
  });
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.updateBanner(req.params.id, req.body);
  return success(res, { message: "Banner updated successfully", banner });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const result = await bannerService.deleteBanner(req.params.id);
  return success(res, null, result.message);
});