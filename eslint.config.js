import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore exact files and catalogs
  {
    ignores: ["node_modules/", "postcss.config.cjs", "dist/", "build/"],
  },

  // Basic recommendations
  eslint.configs.recommended,

  // TypeScript recommendations
  ...tseslint.configs.recommended,

  // Common rules
  {
    files: ["**/*.{js,ts,tsx}"],
    rules: {
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Turns off all rules that are unnecessary or might conflict with Prettier.
  eslintConfigPrettier,
);
