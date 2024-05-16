const fs = require("fs").promises;
const {
  parseLegacyData,
  extractData,
  updateOrCreateOrder,
  initHashManagers,
  saveHashes,
  onOrderUpdated,
  removeOrderListener,
} = require("../../../src/services/OrderProcessingService");
const { users: Users } = require("../../../src/models/User");
const HashUtils = require("../../../src/utils/HashUtils");
const HashManager = require("../../../src/managers/HashManager");
const OrderEventEmitter = require("../../../src/services/OrderEventEmitter");
const MagaLu = require("../../../src/utils/LoggingExtension");

jest.mock("../../../src/utils/HashUtils");
jest.mock("../../../src/utils/LoggingExtension");
jest.mock("../../../src/managers/HashManager");
jest.mock("../../../src/services/OrderEventEmitter");

describe("OrderProcessingService", () => {
  const testLines = `
0000000085                                   Jama Block00000009060000000004      293.4720210618
0000000096                                Nedra Kreiger00000010120000000001     1926.9520211002
0000000051                              Tim Kertzmann V00000005460000000003      364.3720210727
0000000077                         Mrs. Stephen Trantow00000008380000000002      614.8120210511
0000000025                             Frederica Cremin00000002730000000003      115.2320211101
0000000022                             Rosendo Hartmann00000002340000000002      162.8420210415
0000000079                              Pinkie Thompson00000008660000000002     1747.1620210904
0000000085                                   Jama Block00000009080000000002     1872.9420210306
`
    .trim()
    .split("\n");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseLegacyData", () => {
    it("should parse legacy data and return users", () => {
      const data = testLines.join("\n");
      const newLineHashes = new Set();
      HashUtils.getFileHash.mockReturnValue("lineHash");
      HashManager.prototype.hasLineHash.mockReturnValue(false);
      const extractDataMock = jest
        .spyOn(
          require("../../../src/services/OrderProcessingService"),
          "extractData",
        )
        .mockImplementation((line) => extractData(line));
      const updateOrCreateOrderMock = jest.spyOn(
        require("../../../src/services/OrderProcessingService"),
        "updateOrCreateOrder",
      );

      const result = parseLegacyData(data, newLineHashes);

      expect(result).toEqual(expect.any(Array));
      expect(MagaLu.log).toHaveBeenCalledWith(expect.any(Object));
      extractDataMock.mockRestore();
      updateOrCreateOrderMock.mockRestore();
    });
  });

  describe("extractData", () => {
    it("should extract data from a line", () => {
      const line = testLines[0];
      const result = extractData(line);

      expect(result).toEqual([
        "0000000085",
        "Jama Block",
        906,
        4,
        293.47,
        "20210618",
      ]);
      expect(MagaLu.log).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe("updateOrCreateOrder", () => {
    it("should create a new order for a user", () => {
      const userId = "0000000085";
      const userName = "Jama Block";
      const orderId = 906;
      const prodId = 4;
      const value = 293.47;
      const date = "20210618";

      updateOrCreateOrder(userId, userName, orderId, prodId, value, date);

      expect(Users[userId]).toBeDefined();
      expect(Users[userId].findOrder(orderId)).toBeDefined();
      expect(OrderEventEmitter.emit).toHaveBeenCalledWith(
        "orderUpdated",
        expect.any(Object),
      );
    });
  });

  describe("initHashManagers", () => {
    it("should initialize hash managers and log event", async () => {
      HashManager.prototype.loadHashes.mockResolvedValue();

      await initHashManagers();

      expect(MagaLu.log).toHaveBeenCalledWith({
        event: "hashManagers_initialized",
      });
    });

    it("should log error if initialization fails", async () => {
      const error = new Error("Test Error");
      HashManager.prototype.loadHashes.mockRejectedValue(error);

      await expect(initHashManagers()).rejects.toThrow(error);
      expect(MagaLu.error).toHaveBeenCalledWith(
        "Error initializing hash managers:",
        error,
      );
    });
  });

  describe("saveHashes", () => {
    it("should save new file and line hashes", async () => {
      const newFileHashes = new Set();
      const newLineHashes = new Set();

      HashManager.prototype.addHashes.mockResolvedValue();

      await saveHashes(newFileHashes, newLineHashes);

      expect(HashManager.prototype.addHashes).toHaveBeenCalledWith(
        newFileHashes,
        newLineHashes,
      );
    });

    it("should log error if saving hashes fails", async () => {
      const error = new Error("Test Error");
      HashManager.prototype.addHashes.mockRejectedValue(error);

      await saveHashes(new Set(), new Set());

      expect(MagaLu.error).toHaveBeenCalledWith(
        "Error saving file/line hashes:",
        error,
      );
    });
  });

  describe("onOrderUpdated", () => {
    it("should add a listener to the orderUpdated event", () => {
      const listener = jest.fn();

      onOrderUpdated(listener);

      expect(OrderEventEmitter.on).toHaveBeenCalledWith(
        "orderUpdated",
        listener,
      );
    });
  });

  describe("removeOrderListener", () => {
    it("should remove a listener from the orderUpdated event", () => {
      const listener = jest.fn();

      removeOrderListener(listener);

      expect(OrderEventEmitter.removeListener).toHaveBeenCalledWith(
        "orderUpdated",
        listener,
      );
    });
  });
});
