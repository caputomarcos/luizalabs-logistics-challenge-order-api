const httpMocks = require("node-mocks-http");
const OrderController = require("../../../src/controllers/OrderController");
const OrderProcessingService = require("../../../src/services/OrderProcessingService");
const MagaLu = require("../../../src/utils/LoggingExtension");

jest.mock("../../../src/services/OrderProcessingService");
jest.mock("../../../src/utils/LoggingExtension");
jest.mock("../../../src/services/OrderService");

describe("OrderController", () => {
  describe("processUpload", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should handle empty file uploads with 400 error", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/upload",
        files: [],
      });
      const res = httpMocks.createResponse();
      await OrderController.processUpload(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getData()).toEqual({ error: "Nenhum arquivo foi enviado." });
      expect(MagaLu.log).toHaveBeenCalledWith({ event: "no_files_uploaded" });
    });

    it("should handle file upload and respond with user data", async () => {
      const users = [{ id: 1, name: "Test User" }];
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/upload",
        files: [{ path: "test/path" }],
      });
      const res = httpMocks.createResponse();

      OrderProcessingService.processUploadedFiles.mockResolvedValue(users);

      await OrderController.processUpload(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(users);
      expect(MagaLu.log).toHaveBeenCalledWith({
        event: "processUpload_start",
        files: req.files,
      });
      expect(MagaLu.log).toHaveBeenCalledWith({
        event: "processUpload_end",
        users,
      });
    });

    it("should handle errors during file processing", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/upload",
        files: [{ path: "test/path" }],
      });
      const res = httpMocks.createResponse();

      const error = new Error("Test Error");
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
    it("should log the event and return filtered orders", () => {
      const req = httpMocks.createRequest({
        method: "GET",
        url: "/orders",
        query: { userId: "1" },
      });
      const res = httpMocks.createResponse();

      const filteredOrders = [{ id: 1, userId: "1", order: "Test Order" }];
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

    it("should log when no orders are found", () => {
      const req = httpMocks.createRequest({
        method: "GET",
        url: "/orders",
        query: { userId: "1" },
      });
      const res = httpMocks.createResponse();

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
    it("should setup SSE and handle order updates", () => {
      const req = httpMocks.createRequest({
        method: "GET",
        url: "/stream-orders",
      });
      const res = httpMocks.createResponse({
        eventEmitter: require("events").EventEmitter,
      });

      OrderController.streamOrders(req, res);

      expect(res._isEndCalled()).toBe(false);
      expect(res._getHeaders()).toEqual({
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });

      const order = { id: 1, userId: "1", order: "Test Order" };
      OrderProcessingService.onOrderUpdated.mock.calls[0][0](order);
      expect(res._getData()).toContain(`data: ${JSON.stringify(order)}\n\n`);

      req.emit("close");
      expect(OrderProcessingService.removeOrderListener).toHaveBeenCalled();
    });

    afterAll(() => {
      jest.clearAllTimers();
    });
  });
});
