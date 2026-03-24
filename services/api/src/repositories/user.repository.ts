import { prisma } from "../config/prisma";

export function createUser(data: {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}) {
  return prisma.user.create({
    data
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });
}
