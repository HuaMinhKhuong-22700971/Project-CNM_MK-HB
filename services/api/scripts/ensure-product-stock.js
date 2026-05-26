const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

function resolveDatabaseConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, "")
    };
  }

  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cnm_mk_hb"
  };
}

async function tableExists(connection, tableName) {
  const [dbRows] = await connection.execute("SELECT DATABASE() AS db");
  const databaseName = dbRows[0]?.db;
  const [rows] = await connection.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? LIMIT 1",
    [databaseName, tableName]
  );
  return rows.length > 0;
}

async function main() {
  const connection = await mysql.createConnection(resolveDatabaseConfig());

  try {
    if (await tableExists(connection, "products")) {
      await connection.execute(`
        UPDATE products
        SET status = 'ACTIVE', is_active = 1
        WHERE status IS NULL OR UPPER(status) <> 'ACTIVE' OR is_active IS NULL OR is_active = 0
      `);
    }

    if (await tableExists(connection, "product_skus")) {
      await connection.execute(`
        UPDATE product_skus
        SET
          stock = CASE
            WHEN stock IS NULL OR stock < 10 THEN 10 + (id % 41)
            ELSE stock
          END,
          status = 'ACTIVE',
          is_active = 1
      `);
    }

    if (await tableExists(connection, "product_variants")) {
      await connection.execute(`
        UPDATE product_variants
        SET
          stock_quantity = CASE
            WHEN stock_quantity IS NULL OR stock_quantity < 10 THEN 10 + (id % 41)
            ELSE stock_quantity
          END,
          is_active = 1
      `);
    }

    console.log("Product stock normalized: all existing SKU/variants now have at least 10 units.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("ensure-product-stock failed:", error.message);
  process.exit(1);
});
