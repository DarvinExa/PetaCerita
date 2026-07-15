import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Enforce strict TypeScript: disallow explicit 'any'.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Matikan aturan format yang bentrok dengan Prettier. Harus paling akhir.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
