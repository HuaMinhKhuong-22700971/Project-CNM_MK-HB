/**
 * Production / staging seed — tài khoản demo chuẩn README + roles (Database Agnostic via Prisma Client).
 * Chạy: npm run seed:production -w services/api
 */
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

async function ensureRole(roleName) {
  let role = await prisma.role.findFirst({
    where: { name: roleName }
  });

  if (!role) {
    role = await prisma.role.create({
      data: { name: roleName }
    });
  }

  return role.id;
}

async function upsertUser(userSpec, roleId) {
  const email = userSpec.email.toLowerCase();
  const passwordHash = await bcrypt.hash(userSpec.password, 10);

  const existing = await prisma.user.findFirst({
    where: { email }
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: passwordHash,
        full_name: userSpec.fullName,
        role_id: roleId,
        status: "ACTIVE",
        updated_at: new Date()
      }
    });
    return { email, action: "updated" };
  }

  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      full_name: userSpec.fullName,
      role_id: roleId,
      status: "ACTIVE"
    }
  });

  return { email, action: "created" };
}

async function main() {
  try {
    const roleIds = {};
    for (const roleName of REQUIRED_ROLES) {
      roleIds[roleName] = await ensureRole(roleName);
    }

    const results = [];
    for (const userSpec of DEMO_USERS) {
      const roleId = roleIds[userSpec.role];
      results.push(await upsertUser(userSpec, roleId));
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
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("seed-production failed:", error.message);
  process.exit(1);
});
