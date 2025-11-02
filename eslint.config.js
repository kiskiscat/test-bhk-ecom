import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintRules from "eslint/config";

const config = eslintRules.defineConfig([
  // Ignore exact files and catalogs
  {
    ignores: ["node_modules/", "postcss.config.cjs"],
  },

  // Basic recommendations
  eslint.configs.recommended,

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
]);

export default config;
