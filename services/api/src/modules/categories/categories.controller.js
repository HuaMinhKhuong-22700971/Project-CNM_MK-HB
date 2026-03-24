const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const categoriesService = require("./categories.service");

const getAllCategories = asyncHandler(async (_req, res) => {
  const result = await categoriesService.getAllCategories();
  return sendSuccess(res, "Categories fetched successfully", result);
});

const getCategoryTree = asyncHandler(async (_req, res) => {
  const result = await categoriesService.getCategoryTree();
  return sendSuccess(res, "Category tree fetched successfully", result);
});

module.exports = {
  getAllCategories,
  getCategoryTree
};
