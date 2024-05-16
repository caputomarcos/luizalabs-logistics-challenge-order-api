const multer = require("multer");
const path = require("path");
jest.mock("multer");

describe("fileService", () => {
  let originalEnv;

  beforeAll(() => {
    // Save the original process.env
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // Restore the original process.env
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock the multer.diskStorage function
    multer.diskStorage.mockImplementation(() => ({
      destination: (req, file, cb) => cb(null, "./uploads"),
      filename: (req, file, cb) => {
        const dateNowSpy = jest
          .spyOn(Date, "now")
          .mockReturnValue(1630232137000); // Mock Date.now() to return a constant timestamp
        const filename = `testFile_1630232137000${path.extname(file.originalname)}`;
        cb(null, filename);
        dateNowSpy.mockRestore();
      },
    }));

    // Mock the multer function
    multer.mockReturnValue({
      single: jest.fn(),
      array: jest.fn(),
    });
  });

  describe("Multer Configuration", () => {
    it("should set correct destination for file storage", () => {
      const req = {};
      const file = { originalname: "testFile.txt" };
      const cb = jest.fn();
      const storage = multer.diskStorage();
      storage.destination(req, file, cb);
      expect(cb).toHaveBeenCalledWith(null, "./uploads");
    });

    it("should set correct filename for uploaded file", () => {
      const req = {};
      const file = { originalname: "testFile.txt" };
      const cb = jest.fn();
      const storage = multer.diskStorage();
      storage.filename(req, file, cb);
      expect(cb).toHaveBeenCalled();
      const [error, filenameValue] = cb.mock.calls[0];
      expect(error).toBeNull();
      expect(filenameValue).toBe("testFile_1630232137000.txt"); // Checking if the filename contains the mocked timestamp
    });
  });

  describe("storage configuration", () => {
    it("should configure disk storage with correct destination", () => {
      const cbMock = jest.fn();
      multer.diskStorage().destination({}, {}, cbMock);
      expect(cbMock).toHaveBeenCalledWith(null, "./uploads");
    });

    it("should generate the correct filename", () => {
      const cbMock = jest.fn();
      const mockFile = { originalname: "test.png" };
      multer.diskStorage().filename({}, mockFile, cbMock);
      expect(cbMock).toHaveBeenCalledWith(null, "testFile_1630232137000.png"); // Corrected expectation
    });
  });

  describe("Multer Configuration", () => {
    describe("destination", () => {
      it("should set correct destination for file storage", () => {
        const req = {};
        const file = {}; // You can adjust the file object as necessary for the test
        const cb = jest.fn();
        const storage = multer.diskStorage();
        storage.destination(req, file, cb);
        expect(cb).toHaveBeenCalledWith(null, "./uploads");
      });
    });

    describe("filename", () => {
      it("should set correct filename for uploaded file", () => {
        const req = {};
        const file = { originalname: "testFile.txt" };
        const cb = jest.fn();
        const storage = multer.diskStorage();
        storage.filename(req, file, cb);
        expect(cb).toHaveBeenCalled();
        const [error, filenameValue] = cb.mock.calls[0];
        expect(error).toBeNull();
        expect(filenameValue).toBe("testFile_1630232137000.txt"); // Verify if the filename contains the timestamp
      });
    });
  });
});
