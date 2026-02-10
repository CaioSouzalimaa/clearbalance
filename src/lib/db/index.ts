import { PrismaClient } from "@prisma/client";

import { buildDatabaseUrl } from "@/src/lib/db/database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = buildDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
