const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const aiService = require("./ai.service");

const chat = asyncHandler(async (req, res) => {
  const result = await aiService.askTechnicalAdvisor(req.body || {});
  return sendSuccess(res, "AI technical advice generated successfully", result);
});

const getBuildAdvice = asyncHandler(async (req, res) => {
  const result = await aiService.askBuildAdvisor(req.user.id, req.params.buildId, req.body || {});
  return sendSuccess(res, "AI build advice generated successfully", result);
});

module.exports = {
  chat,
  getBuildAdvice
};
