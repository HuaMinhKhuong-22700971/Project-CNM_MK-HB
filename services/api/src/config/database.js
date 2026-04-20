const mysql = require("mysql2/promise");

const { env } = require("./env");

let pool;

function createPool() {
  return mysql.createPool({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
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
  const [rows] = await getDbPool().query(sql, params);
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
