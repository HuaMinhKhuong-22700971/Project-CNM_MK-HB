const { query, testConnection } = require("../config/database");

async function checkDatabaseHealth() {
  const connectionResult = await testConnection();
  const rows = await query("SELECT NOW() AS currentTime, DATABASE() AS databaseName");
  const databaseInfo = rows[0] || null;

  return {
    ...connectionResult,
    data: databaseInfo
  };
}

module.exports = {
  checkDatabaseHealth
};
