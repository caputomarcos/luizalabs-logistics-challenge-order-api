const httpMocks = require("node-mocks-http");
const OrderController = require("../../src/controllers/OrderController");
const OrderProcessingService = require("../../src/services/OrderProcessingService");
const MagaLu = require("../../src/utils/LoggingExtension");

jest.mock("../../src/services/OrderProcessingService");
jest.mock("../../src/utils/LoggingExtension");

describe("orderController integration tests", () => {
  describe("processUpload", () => {
    let req, res, consoleSpy;

    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
      consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("should return 400 if no files are uploaded", async () => {
      req.files = [];
      await OrderController.processUpload(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getData()).toEqual({ error: "Nenhum arquivo foi enviado." });
      expect(MagaLu.log).toHaveBeenCalledWith({ event: "no_files_uploaded" });
    });

    test("should return 500 if file processing fails", async () => {
      req.files = [{ path: "test/path" }];
      const error = new Error("Test error");
      OrderProcessingService.processUploadedFiles.mockRejectedValue(error);

      await OrderController.processUpload(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getData()).toEqual({
        error: "Falha ao processar os arquivos enviados.",
      });
      expect(MagaLu.error).toHaveBeenCalledWith(
        "Erro ao processar arquivos:",
        error,
      );
    });
  });

  describe("getOrders", () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });

    test("should return filtered orders", () => {
      req.query = {
        userId: "1",
        orderId: "1",
        startDate: "2021-01-01",
        endDate: "2021-12-31",
      };
      const filteredOrders = [{ id: 1, name: "John Doe" }];
      OrderProcessingService.filterOrders.mockReturnValue(filteredOrders);

      OrderController.getOrders(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(filteredOrders);
      expect(MagaLu.log).toHaveBeenCalledWith({
        event: "getOrders",
        query: req.query,
      });
      expect(MagaLu.log).toHaveBeenCalledWith({
        event: "filteredOrders",
        filteredOrders,
      });
    });

    test("should log and return empty array if no orders found", () => {
      req.query = {
        userId: "1",
        orderId: "1",
        startDate: "2021-01-01",
        endDate: "2021-12-31",
      };
      const filteredOrders = [];
      OrderProcessingService.filterOrders.mockReturnValue(filteredOrders);

      OrderController.getOrders(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(filteredOrders);
      expect(MagaLu.log).toHaveBeenCalledWith({
        event: "no_orders_found",
        message: "Nenhuma ordem foi encontrada correspondente aos critérios.",
      });
    });
  });

  describe("streamOrders", () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse({
        eventEmitter: require("events").EventEmitter,
      });
      res.writeHead = jest.fn();
      res.write = jest.fn();
      res.end = jest.fn();
    });

    test("should send events and handle stream closing", () => {
      const order = { id: 1, name: "John Doe" };
      OrderProcessingService.onOrderUpdated.mockImplementation((callback) =>
        callback(order),
      );

      OrderController.streamOrders(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      expect(res.write).toHaveBeenCalledWith(
        `data: ${JSON.stringify(order)}\n\n`,
      );

      res.finished = true;
      req.emit("close");

      expect(res.end).toHaveBeenCalled();
    });
  });
});
