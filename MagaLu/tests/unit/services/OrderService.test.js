const OrderService = require("../../../src/services/OrderService");
const UserOrder = require("../../../src/models/UserOrder");
const MagaLu = require("../../../src/utils/LoggingExtension");

jest.mock("../../../src/models/UserOrder");
jest.mock("../../../src/utils/LoggingExtension");

describe("orderService", () => {
  describe("saveProcessedData", () => {
    const processedData = [
      { userId: 1, orderId: 1, data: "some data" },
      { userId: 2, orderId: 2, data: "some more data" },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should save processed data to MongoDB", async () => {
      UserOrder.insertMany.mockResolvedValue();

      await OrderService.saveProcessedData(processedData);

      expect(UserOrder.insertMany).toHaveBeenCalledWith(processedData);
      expect(MagaLu.log).toHaveBeenCalledWith({
        event: "data_processed",
        message: "Dados salvos no MongoDB com sucesso.",
      });
    });

    test("should log an error if saving data fails", async () => {
      const error = new Error("Test error");
      UserOrder.insertMany.mockRejectedValue(error);

      await expect(
        OrderService.saveProcessedData(processedData),
      ).rejects.toThrow(error);

      expect(UserOrder.insertMany).toHaveBeenCalledWith(processedData);
      expect(MagaLu.error).toHaveBeenCalledWith({
        event: "data_processed",
        message: "Erro ao salvar dados no MongoDB.",
        error: error,
      });
    });
  });
});
