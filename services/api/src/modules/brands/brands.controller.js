const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const brandsService = require("./brands.service");

const getAllBrands = asyncHandler(async (_req, res) => {
  const result = await brandsService.getAllBrands();
  return sendSuccess(res, "Brands fetched successfully", result);
});

module.exports = {
  getAllBrands
};
