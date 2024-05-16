module.exports = {
  testMatch: ["**/*.test.js"],
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  detectOpenHandles: true,
  forceExit: true,
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  coverageDirectory: "reports/coverage",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Update the path accordingly
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
  },
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Test Report",
        outputPath: "reports/jest_report.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
        theme: "lightTheme",
      },
    ],
  ],
};
