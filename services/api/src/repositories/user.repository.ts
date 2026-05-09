import { prisma } from "../config/prisma";

export async function createUser(data: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role?: string;
}) {
  const { email, password, fullName, phone, role } = data;
  const normalizedRoleName = String(role || "CUSTOMER").trim().toUpperCase();
  const resolvedRole = await prisma.role.findFirst({
    where: { name: normalizedRoleName }
  });

  if (!resolvedRole) {
    throw new Error(`Role ${normalizedRoleName} not found`);
  }

  // Use raw SQL to bypass Prisma Client sync issues with the new 'phone' field
  await prisma.$executeRawUnsafe(
    `INSERT INTO users (email, password, full_name, phone, role_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    email, password, fullName, phone, resolvedRole.id
  );

  return prisma.user.findUnique({
    where: { email },
    include: { Role: true }
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { Role: true }
  });
}

export function findUserById(id: string | number) {
  return prisma.user.findUnique({
    where: { id: typeof id === "string" ? parseInt(id, 10) : id },
    include: { Role: true }
  });
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { created_at: "desc" },
    include: { Role: true }
  });
}

export function findUserByPhone(phone: string) {
  return prisma.user.findFirst({
    where: { phone },
    include: { Role: true }
  });
}
