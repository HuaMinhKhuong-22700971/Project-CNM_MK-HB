const { sendSuccess } = require("../../utils/api-response");
const usersService = require("./users.service");

function getProfile(req, res) {
  const result = usersService.getProfile(req.user);
  return sendSuccess(res, "User profile fetched successfully", result);
}

module.exports = {
  getProfile
};
