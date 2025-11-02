import eslint from "@eslint/js";
import eslintRules from "eslint/config";
import eslintConfigPrettierPlugin from "eslint-config-prettier";
import tseslintPlugin from "typescript-eslint";

const config = eslintRules.defineConfig([
  // Ignore exact files and catalogs
  {
    ignores: ["node_modules/", "dist/"],
  },

  // Basic recommendations
  eslint.configs.recommended,

  // TypeScript check
  tseslintPlugin.configs.recommended,
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },

  // Common rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Turns off all rules that are unnecessary or might conflict with Prettier.
  eslintConfigPrettierPlugin,
]);

export default config;
