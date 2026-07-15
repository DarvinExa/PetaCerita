import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolusi path alias @/* dari tsconfig secara native.
    tsconfigPaths: true,
    alias: {
      // "server-only" hanya penanda build; stub jadi modul kosong saat test.
      "server-only": new URL("./test/server-only-stub.ts", import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Playwright e2e dijalankan terpisah lewat test:e2e.
    exclude: ["node_modules", ".next", "e2e"],
  },
});
