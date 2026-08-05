const mysql = require("mysql2/promise");
const { env } = require("./env");

let pool;

function createPool() {
  const nextPool = mysql.createPool({
    host: env.dbHost || "127.0.0.1",
    port: Number(env.dbPort || 3306),
    user: env.dbUser || "root",
    password: env.dbPassword ?? "",
    database: env.dbName || "cnm_ecommerce",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  nextPool.on("connection", (connection) => {
    connection.query("SET time_zone = '+07:00'");
  });

  return nextPool;
}

function getDbPool() {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}

async function testConnection() {
  const connection = await getDbPool().getConnection();

  try {
    await connection.ping();

    return {
      success: true,
      message: "MySQL connection established successfully"
    };
  } finally {
    connection.release();
  }
}

async function query(sql, params = []) {
  const [rows] = await getDbPool().execute(sql, params);
  return rows;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getDbPool,
  testConnection,
  query,
  closePool
};
