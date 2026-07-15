import { defineConfig, env } from "prisma/config";
import { config as loadEnv } from "dotenv";

// Prisma 7 tidak otomatis memuat .env, jadi muat manual untuk CLI migrasi.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI migrasi memakai koneksi langsung (port 5432), bukan pooler.
    url: env("DIRECT_URL"),
  },
});
