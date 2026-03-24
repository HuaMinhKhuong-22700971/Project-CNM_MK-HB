const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const compatibilityService = require("./compatibility.service");

const checkBuildCompatibility = asyncHandler(async (req, res) => {
  const result = await compatibilityService.checkBuildCompatibility(req.user.id, req.params.buildId);
  return sendSuccess(res, "Build compatibility checked successfully", result);
});

module.exports = {
  checkBuildCompatibility
};
