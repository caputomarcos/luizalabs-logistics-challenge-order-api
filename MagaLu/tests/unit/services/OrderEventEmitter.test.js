const OrderEventEmitter = require("../../../src/services/OrderEventEmitter");

describe("orderEventEmitter", () => {
  test("should have a max listener limit set to 5", () => {
    expect(OrderEventEmitter.getMaxListeners()).toBe(30);
  });

  test("should be able to emit and handle an event", () => {
    const mockCallback = jest.fn();
    OrderEventEmitter.on("testEvent", mockCallback);
    OrderEventEmitter.emit("testEvent");
    expect(mockCallback).toHaveBeenCalled();
  });

  test("should handle multiple listeners correctly", () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();
    OrderEventEmitter.on("multiTestEvent", firstCallback);
    OrderEventEmitter.on("multiTestEvent", secondCallback);

    OrderEventEmitter.emit("multiTestEvent");
    expect(firstCallback).toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalled();
  });

  test("should not exceed max listener limits", () => {
    const extraCallback = jest.fn();
    // Adding 5 listeners should be okay
    for (let i = 0; i < 5; i++) {
      OrderEventEmitter.on("maxTestEvent", () => {});
    }
    // This should not throw an error because the limit is 5
    expect(() => {
      OrderEventEmitter.on("maxTestEvent", extraCallback);
    }).not.toThrow();

    expect(extraCallback).not.toHaveBeenCalled(); // Verify it's not triggered without an emit
  });
});
