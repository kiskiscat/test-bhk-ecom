/** @type {import('stylelint').Config} */
const config = {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-css-modules",
    "stylelint-config-recess-order",
  ],
  rules: {
    "value-keyword-case": null,
    "color-hex-length": "long",
  },
  overrides: [
    {
      files: ["**/*.module.css"],
      rules: {
        "selector-class-pattern": [
          "^[a-z][a-zA-Z0-9]+$",
          {
            message: "Class names should be in camelCase.",
          },
        ],
      },
    },
  ],
};

export default config;
