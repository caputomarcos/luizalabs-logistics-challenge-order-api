import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        path: "readonly",
        __dirname: "readonly",
        process: "readonly"
      }
    }
  },
  {
    files: ["jest.setup.js", "**/*.test.js", "tests/**/*.js"], // Specify Jest environment for test files
    languageOptions: {
      globals: globals.jest
    }
  },
  {
    languageOptions: {
      globals: globals.browser
    }
  },
  pluginJs.configs.recommended,
  {
    ignores: ["tests/**/*.js", "**/*.test.js", "reports/**/*.js"] // Add this line to ignore test files
  }
];
