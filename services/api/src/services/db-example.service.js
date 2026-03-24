const { query } = require("../config/database");

async function getDatabaseTime() {
  const rows = await query("SELECT NOW() AS currentTime");
  return rows[0] || null;
}

async function getProductCount() {
  const rows = await query("SELECT COUNT(*) AS totalProducts FROM products");
  return rows[0] || { totalProducts: 0 };
}

module.exports = {
  getDatabaseTime,
  getProductCount
};
