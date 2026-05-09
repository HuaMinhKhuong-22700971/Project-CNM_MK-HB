const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const pcBuilderService = require("./pc-builder.service");

const createBuild = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.createBuild(req.user.id, req.body || {});
  return sendSuccess(res, "PC build created successfully", result, 201);
});

const getCurrentBuild = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.getCurrentBuild(req.user.id);
  return sendSuccess(res, "Current PC build fetched successfully", result);
});

const addBuildItem = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.upsertBuildItem(req.user.id, req.params.buildId, req.body || {});
  return sendSuccess(res, "PC build item added successfully", result, 201);
});

const replaceBuildItem = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    componentType: req.params.componentType
  };
  const result = await pcBuilderService.upsertBuildItem(req.user.id, req.params.buildId, payload);
  return sendSuccess(res, "PC build item updated successfully", result);
});

const getBuildDetail = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.getBuildDetail(req.user.id, req.params.buildId);
  return sendSuccess(res, "PC build detail fetched successfully", result);
});

const removeBuildItem = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.removeBuildItem(req.user.id, req.params.buildId, req.params.componentType);
  return sendSuccess(res, "PC build item removed successfully", result);
});

const saveBuild = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.saveBuild(req.user.id, req.params.buildId, req.body || {});
  return sendSuccess(res, "PC build saved successfully", result);
});

const suggestBuild = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.suggestBuild(req.body || {});
  return sendSuccess(res, "PC build suggestion generated successfully", result);
});

const checkRawCompatibility = asyncHandler(async (req, res) => {
  const result = await pcBuilderService.checkRawCompatibility(req.body || {});
  return sendSuccess(res, "PC build compatibility checked successfully", result);
});

module.exports = {
  createBuild,
  getCurrentBuild,
  addBuildItem,
  replaceBuildItem,
  getBuildDetail,
  removeBuildItem,
  saveBuild,
  suggestBuild,
  checkRawCompatibility
};
