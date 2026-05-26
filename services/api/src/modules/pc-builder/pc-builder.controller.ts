import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import pcBuilderService from "./pc-builder.service";

function getAuthUserId(req: Request) {
  const rawUserId = (req as any)?.user?.userId;
  if (!rawUserId) {
    throw new Error("Authenticated user id is missing");
  }
  return Number(rawUserId);
}

/**
 * Controller for PC Builder module.
 * Maps HTTP requests to service layer methods.
 */
export const createBuild = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.createBuild(getAuthUserId(req), req.body || {});
  return sendSuccess(res, "PC build created successfully", result, 201);
});

export const getCurrentBuild = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.getCurrentBuild(getAuthUserId(req));
  return sendSuccess(res, "Current PC build fetched successfully", result);
});

export const addBuildItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.upsertBuildItem(getAuthUserId(req), req.params.buildId, req.body || {});
  return sendSuccess(res, "PC build item added successfully", result, 201);
});

export const getBuildDetail = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.getBuildDetail(getAuthUserId(req), req.params.buildId);
  return sendSuccess(res, "PC build detail fetched successfully", result);
});

export const removeBuildItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.removeBuildItem(getAuthUserId(req), req.params.buildId, req.params.componentType);
  return sendSuccess(res, "PC build item removed successfully", result);
});

export const saveBuild = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.saveBuild(getAuthUserId(req), req.params.buildId, req.body || {});
  return sendSuccess(res, "PC build saved successfully", result);
});

export const suggestBuild = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.suggestBuild(req.body || {});
  return sendSuccess(res, "PC build suggestion generated successfully", result);
});

export const checkRawCompatibility = asyncHandler(async (req: Request, res: Response) => {
  const result = await pcBuilderService.checkRawCompatibility(req.body || {});
  return sendSuccess(res, "PC build compatibility checked successfully", result);
});

export default {
  createBuild,
  getCurrentBuild,
  addBuildItem,
  getBuildDetail,
  removeBuildItem,
  saveBuild,
  suggestBuild,
  checkRawCompatibility
};
