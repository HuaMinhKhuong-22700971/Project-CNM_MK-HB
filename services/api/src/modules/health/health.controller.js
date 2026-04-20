const { sendSuccess } = require("../../utils/api-response");
const { checkDatabaseHealth } = require("../../services/test-connection.service");

async function getApiHealth(_req, res) {
  return sendSuccess(res, "API is running", {
    service: "api",
    timestamp: new Date().toISOString()
  });
}

async function getDatabaseHealth(_req, res, next) {
  try {
    const result = await checkDatabaseHealth();
    return sendSuccess(res, "Database connection is healthy", result);
  } catch (error) {
    error.statusCode = 500;
    return next(error);
  }
}

module.exports = {
  getApiHealth,
  getDatabaseHealth
};
