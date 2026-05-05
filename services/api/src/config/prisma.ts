// Workaround for Prisma export resolution issues in some Windows TS setups.
// We intentionally require the runtime constructor here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
// Import from local generated path to bypass node_modules file locks
import { PrismaClient } from "../generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
