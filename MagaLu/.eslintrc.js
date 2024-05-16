module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12, // or latest
    sourceType: "module",
  },
  globals: {
    process: "readonly",
    require: "readonly",
    __dirname: "readonly",
    module: "readonly",
  },
  rules: {
    // Example rule
    "no-unused-vars": "warn",
    "no-undef": "warn",
  },
  ignorePatterns: ["node_modules/", "dist/", "build/"],
  overrides: [
    {
      files: ["**/*.js"],
      excludedFilesGlobPatterns: ["*.test.js"], // Corrigindo o nome da chave
      rules: {
        "no-unused-expressions": "off",
      },
    },
  ],
};
