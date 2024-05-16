const OrderProcessor = require("../../../src/services/OrderProcessor");

describe("OrderProcessor", () => {
  let order;

  beforeEach(() => {
    order = new OrderProcessor(156, "John Doe");
  });

  test("Constructor should create an order with the correct properties", () => {
    expect(order.userId).toBe(156);
    expect(order.userName).toBe("John Doe");
    expect(order.orders).toEqual([]);
  });

  test("addOrder method should add a new order to the orders list", () => {
    order.addOrder(1234, "20220101");
    expect(order.orders).toHaveLength(1);
    expect(order.orders[0].orderId).toBe(1234);
    expect(order.orders[0].date).toBe("2022-01-01");
    expect(order.orders[0].products).toEqual([]);
    expect(order.orders[0].total).toBe(0.0);
  });

  test("findOrder method should find an order by ID", () => {
    order.addOrder(1234, "20220101");
    expect(order.findOrder(1234)).toBeDefined();
    expect(order.findOrder(1234).orderId).toBe(1234);
  });

  test("findOrder method should return undefined if order ID is not found", () => {
    expect(order.findOrder(1234)).toBeUndefined();
  });
});
