const fs = require("fs").promises;
const path = require("path");
const HashManager = require("../../../src/managers/HashManager"); // Atualize o caminho conforme necessário

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe("HashManager", () => {
  let hashManager;
  const fileHashesPath = path.join(__dirname, "fileHashes.json");
  const lineHashesPath = path.join(__dirname, "lineHashes.json");

  beforeEach(() => {
    hashManager = new HashManager(fileHashesPath, lineHashesPath);
  });

  describe("loadHashes", () => {
    it("should load file hashes from file", async () => {
      const fileHashes = ["fileHash1", "fileHash2"];
      fs.readFile.mockResolvedValueOnce(JSON.stringify(fileHashes));

      await hashManager.loadHashes();

      expect(hashManager.fileHashes).toEqual(new Set(fileHashes));
    });

    it("should load line hashes from file", async () => {
      const lineHashes = ["lineHash1", "lineHash2"];
      fs.readFile.mockResolvedValueOnce("{}"); // For fileHashes
      fs.readFile.mockResolvedValueOnce(JSON.stringify(lineHashes));

      await hashManager.loadHashes();

      expect(hashManager.lineHashes).toEqual(new Set(lineHashes));
    });

    it("should handle file not found error gracefully", async () => {
      fs.readFile.mockRejectedValueOnce({ code: "ENOENT" });
      fs.readFile.mockRejectedValueOnce({ code: "ENOENT" });

      await hashManager.loadHashes();

      expect(hashManager.fileHashes).toEqual(new Set());
      expect(hashManager.lineHashes).toEqual(new Set());
    });
  });

  describe("saveHashes", () => {
    it("should save file hashes to file", async () => {
      hashManager.fileHashes.add("fileHash1");

      await hashManager.saveHashes();

      expect(fs.writeFile).toHaveBeenCalledWith(
        fileHashesPath,
        JSON.stringify(["fileHash1"]),
        "utf8",
      );
    });

    it("should save line hashes to file", async () => {
      hashManager.lineHashes.add("lineHash1");

      await hashManager.saveHashes();

      expect(fs.writeFile).toHaveBeenCalledWith(
        lineHashesPath,
        JSON.stringify(["lineHash1"]),
        "utf8",
      );
    });

    it("should log error if writeFile fails for fileHashes", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Write error");
      fs.writeFile.mockRejectedValueOnce(error);

      await hashManager.saveHashes();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erro ao salvar os hashes de arquivos:",
        error,
      );
      consoleSpy.mockRestore();
    });

    it("should log error if writeFile fails for lineHashes", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Write error");
      fs.writeFile.mockResolvedValueOnce(); // For fileHashes
      fs.writeFile.mockRejectedValueOnce(error);

      await hashManager.saveHashes();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erro ao salvar os hashes de linhas:",
        error,
      );
      consoleSpy.mockRestore();
    });
  });

  describe("hasFileHash", () => {
    it("should return true if file hash is present", () => {
      hashManager.fileHashes.add("fileHash1");

      expect(hashManager.hasFileHash("fileHash1")).toBe(true);
    });

    it("should return false if file hash is not present", () => {
      expect(hashManager.hasFileHash("fileHash1")).toBe(false);
    });
  });

  describe("addFileHash", () => {
    it("should add a file hash", () => {
      hashManager.addFileHash("fileHash1");

      expect(hashManager.fileHashes.has("fileHash1")).toBe(true);
    });
  });

  describe("hasLineHash", () => {
    it("should return true if line hash is present", () => {
      hashManager.lineHashes.add("lineHash1");

      expect(hashManager.hasLineHash("lineHash1")).toBe(true);
    });

    it("should return false if line hash is not present", () => {
      expect(hashManager.hasLineHash("lineHash1")).toBe(false);
    });
  });

  describe("addLineHash", () => {
    it("should add a line hash", () => {
      hashManager.addLineHash("lineHash1");

      expect(hashManager.lineHashes.has("lineHash1")).toBe(true);
    });
  });

  describe("addHashes", () => {
    it("should add file and line hashes and save them", async () => {
      const newFileHashes = ["fileHash1", "fileHash2"];
      const newLineHashes = ["lineHash1", "lineHash2"];

      const saveHashesSpy = jest
        .spyOn(hashManager, "saveHashes")
        .mockResolvedValue();

      await hashManager.addHashes(newFileHashes, newLineHashes);

      expect(hashManager.fileHashes).toEqual(new Set(newFileHashes));
      expect(hashManager.lineHashes).toEqual(new Set(newLineHashes));
      expect(saveHashesSpy).toHaveBeenCalled();

      saveHashesSpy.mockRestore();
    });
  });
});
