import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Atlas-specific:
    "src/generated/**", // Prisma client (auto-generated)
    "data/lmic/**", // ingested LMIC JSON cache
    "public/_legacy/**", // preserved demo_v1 HTML/JS
  ]),
]);

export default eslintConfig;
