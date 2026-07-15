import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { serverEnv } from "@/lib/env";

// Singleton agar hot-reload di dev tidak membuat banyak koneksi.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  // Prisma 7 memakai driver adapter; koneksi pooled dipakai saat runtime.
  const adapter = new PrismaPg({ connectionString: serverEnv.databaseUrl });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
