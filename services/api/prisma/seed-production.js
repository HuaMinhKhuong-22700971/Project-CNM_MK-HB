/**
 * Production / staging seed — tài khoản demo chuẩn README + roles.
 * Chạy: npm run seed:production -w services/api
 */
const path = require("path");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const DEMO_USERS = [
  {
    email: "admin@cnm.local",
    password: "Admin@123",
    fullName: "System Admin",
    role: "ADMIN"
  },
  {
    email: "sales@cnm.local",
    password: "Sales@123",
    fullName: "Sales Staff",
    role: "SALES_STAFF"
  },
  {
    email: "tech1@cnm.local",
    password: "Tech@123",
    fullName: "Technician One",
    role: "TECH_STAFF"
  },
  {
    email: "customer@cnm.local",
    password: "Customer@123",
    fullName: "Demo Customer",
    role: "CUSTOMER"
  }
];

const REQUIRED_ROLES = ["ADMIN", "CUSTOMER", "SALES_STAFF", "TECH_STAFF", "STAFF"];

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

async function ensureRole(connection, roleName) {
  const [existing] = await connection.execute(
    "SELECT id FROM roles WHERE UPPER(name) = ? LIMIT 1",
    [roleName]
  );

  if (existing.length) {
    return existing[0].id;
  }

  const [result] = await connection.execute("INSERT INTO roles (name) VALUES (?)", [roleName]);
  return result.insertId;
}

async function upsertUser(connection, userSpec, roleId) {
  const email = userSpec.email.toLowerCase();
  const passwordHash = await bcrypt.hash(userSpec.password, 10);

  const [rows] = await connection.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

  if (rows.length) {
    await connection.execute(
      `UPDATE users
       SET password = ?, full_name = ?, role_id = ?, status = 'ACTIVE', updated_at = NOW()
       WHERE id = ?`,
      [passwordHash, userSpec.fullName, roleId, rows[0].id]
    );
    return { email, action: "updated" };
  }

  await connection.execute(
    `INSERT INTO users (email, password, full_name, role_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
    [email, passwordHash, userSpec.fullName, roleId]
  );

  return { email, action: "created" };
}

async function main() {
  const dbConfig = resolveDatabaseConfig();
  const connection = await mysql.createConnection(dbConfig);

  try {
    for (const roleName of REQUIRED_ROLES) {
      await ensureRole(connection, roleName);
    }

    const roleIds = {};
    for (const userSpec of DEMO_USERS) {
      if (!roleIds[userSpec.role]) {
        roleIds[userSpec.role] = await ensureRole(connection, userSpec.role);
      }
    }

    const results = [];
    for (const userSpec of DEMO_USERS) {
      const roleId = roleIds[userSpec.role];
      results.push(await upsertUser(connection, userSpec, roleId));
    }

    console.log("Production seed completed:");
    for (const row of results) {
      console.log(`- ${row.email} (${row.action})`);
    }
    console.log("\nDemo passwords (see README):");
    console.log("- admin@cnm.local / Admin@123");
    console.log("- sales@cnm.local / Sales@123");
    console.log("- tech1@cnm.local / Tech@123");
    console.log("- customer@cnm.local / Customer@123");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("seed-production failed:", error.message);
  process.exit(1);
});
