import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Keep lint usable: disable overly-strict rules that don't match this codebase's patterns.
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["scripts/**/*.{js,cjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts"
  ])
]);

