const httpMocks = require("node-mocks-http");
const LoggingMiddleware = require("../../../src/middlewares/LoggingMiddleware");
const MagaLu = require("../../../src/utils/LoggingExtension");

jest.mock("../../../src/utils/LoggingExtension");

describe("loggingMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/test",
      body: {
        key: "value",
      },
    });
    res = httpMocks.createResponse();
    next = jest.fn();
    // Spy on res.send method
    res.send = jest.fn(res.send.bind(res));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should log request details", () => {
    LoggingMiddleware(req, res, next);

    expect(MagaLu.log).toHaveBeenCalledWith({
      event: "loggingMiddleware",
      message: "Nova requisição recebida",
    });
    expect(next).toHaveBeenCalled();
  });

  test("should log response details and call original res.send", () => {
    LoggingMiddleware(req, res, next);

    const responseBody = { message: "Hello World" };
    res.send(responseBody);

    expect(res._getData()).toEqual(responseBody);
  });

  test("should replace and restore res.send correctly", () => {
    const originalSend = res.send;
    LoggingMiddleware(req, res, next);

    const responseBody = { message: "Hello World" };
    res.send(responseBody);

    expect(res.send).not.toBe(originalSend);
    expect(originalSend).toHaveBeenCalledWith(responseBody);
  });
});
