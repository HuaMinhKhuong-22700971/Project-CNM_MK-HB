const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const productsService = require("./products.service");

const getProducts = asyncHandler(async (req, res) => {
  const result = await productsService.getProducts(req.query || {});
  return sendSuccess(res, "Products fetched successfully", result);
});

const getProductFilterOptions = asyncHandler(async (_req, res) => {
  const result = await productsService.getFilterOptions();
  return sendSuccess(res, "Product filter options fetched successfully", result);
});

const getCompareProducts = asyncHandler(async (req, res) => {
  const result = await productsService.compareProducts(req.query?.ids || req.body?.ids || "");
  return sendSuccess(res, "Products compared successfully", result);
});

const getProductDetail = asyncHandler(async (req, res) => {
  const result = await productsService.getProductDetail(req.params.idOrSlug);
  return sendSuccess(res, "Product detail fetched successfully", result);
});

module.exports = {
  getProducts,
  getProductFilterOptions,
  getCompareProducts,
  getProductDetail
};
