const request = require("supertest");
const express = require("express");
const Router = require("../../../src/api/Routes"); // Ajuste o caminho conforme necessário

jest.mock("../../../src/controllers/OrderController", () => ({
  processUpload: jest.fn((req, res) =>
    res.status(200).json({ message: "Upload processed" }),
  ),
  getOrders: jest.fn((req, res) =>
    res.status(200).json([{ id: 1, name: "Test Order" }]),
  ),
  streamOrders: jest.fn((req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(`data: ${JSON.stringify({ id: 1, name: "Test Order" })}\n\n`);
    res.end();
  }),
}));

jest.mock("../../../src/services/FileService", () => ({
  upload: {
    array: () => (req, res, next) => next(),
  },
}));

jest.mock("../../../src/models/UserOrder", () => ({
  find: jest
    .fn()
    .mockResolvedValue([{ userId: 1, orderId: 1, name: "Test Order" }]),
}));

const app = express();
app.use(express.json());
app.use("/", Router);

describe("Router tests", () => {
  describe("POST /upload", () => {
    it("should process uploaded files", async () => {
      const response = await request(app)
        .post("/upload")
        .attach("file", Buffer.from("test file"), "test.txt");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Upload processed" });
    });
  });

  describe("GET /memory/orders", () => {
    it("should return orders from memory", async () => {
      const response = await request(app).get("/memory/orders");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, name: "Test Order" }]);
    });
  });

  describe("GET /database/orders", () => {
    it("should return orders from database with filters", async () => {
      const response = await request(app)
        .get("/database/orders")
        .query({ userId: 1, orderId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { userId: 1, orderId: 1, name: "Test Order" },
      ]);
    });
  });

  describe("GET /stream-orders", () => {
    it("should stream orders in real-time", async () => {
      const response = await request(app).get("/stream-orders").expect(200);

      expect(response.headers["content-type"]).toMatch(/text\/event-stream/);
      expect(response.text).toContain('data: {"id":1,"name":"Test Order"}\n\n');
    });
  });
});
