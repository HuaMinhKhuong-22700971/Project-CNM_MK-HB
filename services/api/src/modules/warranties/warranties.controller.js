const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const warrantiesService = require("./warranties.service");

const getEligibleItems = asyncHandler(async (req, res) => {
  const result = await warrantiesService.getEligibleOrderItems(req.user.id);
  return sendSuccess(res, "Eligible warranty items fetched successfully", result);
});

const getMyWarranties = asyncHandler(async (req, res) => {
  const result = await warrantiesService.getMyWarranties(req.user.id, req.query || {});
  return sendSuccess(res, "Warranties fetched successfully", result);
});

const activateWarranty = asyncHandler(async (req, res) => {
  const result = await warrantiesService.activateWarranty(req.user.id, req.body || {});
  return sendSuccess(res, "Warranty activated successfully", result, 201);
});

module.exports = {
  getEligibleItems,
  getMyWarranties,
  activateWarranty
};
