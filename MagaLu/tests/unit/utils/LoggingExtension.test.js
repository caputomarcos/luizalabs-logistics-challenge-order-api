const getLoggingExtension = () => {
  delete require.cache[require.resolve("../../../src/utils/LoggingExtension")];
  return require("../../../src/utils/LoggingExtension");
};

describe("loggingExtension", () => {
  let originalLog, originalInfo, originalWarn, originalError;

  beforeAll(() => {
    originalLog = console.log;
    originalInfo = console.info;
    originalWarn = console.warn;
    originalError = console.error;

    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const scenarios = [
    { isEnabled: "true", isProd: "production", expectedPrefix: "" },
    // { isEnabled: 'true', isProd: 'development', expectedPrefix: '[DEV]' },
    // { isEnabled: 'false', isProd: 'production', expectedPrefix: null },
    // { isEnabled: 'false', isProd: 'development', expectedPrefix: null },
  ];

  scenarios.forEach(({ isEnabled, isProd, expectedPrefix }) => {
    describe(`when LOGGING_ENABLED is ${isEnabled} and NODE_ENV is ${isProd}`, () => {
      let loggingExtension;

      beforeEach(() => {
        process.env.LOGGING_ENABLED = isEnabled;
        process.env.NODE_ENV = isProd;

        loggingExtension = getLoggingExtension();
      });

      test("log method", () => {
        loggingExtension.log("test log");
        if (expectedPrefix !== null) {
          if (expectedPrefix === "") {
            expect(console.log).toHaveBeenCalledWith("test log");
          } else {
            expect(console.log).toHaveBeenCalledWith(
              expectedPrefix,
              "test log",
            );
          }
        } else {
          expect(console.log).not.toHaveBeenCalled();
        }
      });

      test("info method", () => {
        loggingExtension.info("test info");
        if (expectedPrefix !== null) {
          if (expectedPrefix === "") {
            expect(console.info).toHaveBeenCalledWith("test info");
          } else {
            expect(console.info).toHaveBeenCalledWith(
              expectedPrefix,
              "test info",
            );
          }
        } else {
          expect(console.info).not.toHaveBeenCalled();
        }
      });

      test("warn method", () => {
        loggingExtension.warn("test warn");
        if (expectedPrefix !== null) {
          if (expectedPrefix === "") {
            expect(console.warn).toHaveBeenCalledWith("test warn");
          } else {
            expect(console.warn).toHaveBeenCalledWith(
              expectedPrefix,
              "test warn",
            );
          }
        } else {
          expect(console.warn).not.toHaveBeenCalled();
        }
      });

      test("error method", () => {
        loggingExtension.error("test error");
        if (expectedPrefix !== null) {
          if (expectedPrefix === "") {
            expect(console.error).toHaveBeenCalledWith("test error");
          } else {
            expect(console.error).toHaveBeenCalledWith(
              expectedPrefix,
              "test error",
            );
          }
        } else {
          expect(console.error).not.toHaveBeenCalled();
        }
      });
    });
  });
});
