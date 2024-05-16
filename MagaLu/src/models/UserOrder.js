const mongoose = require("mongoose");

/**
 * Define o esquema de produto com productId e value.
 */
const productSchema = new mongoose.Schema({
  productId: Number, // Identificador do produto
  value: Number, // Valor do produto
});

/**
 * Define o esquema de pedido com orderId, date, products e total.
 */
const orderSchema = new mongoose.Schema({
  orderId: Number, // Identificador do pedido
  date: String, // Data do pedido
  products: [productSchema], // Produtos do pedido
  total: Number, // Total do pedido
});

/**
 * Define o esquema de pedido do usuário com userId, userName e orders.
 */
const userOrderSchema = new mongoose.Schema({
  userId: Number, // Identificador do usuário
  userName: String, // Nome do usuário
  orders: [orderSchema], // Pedidos do usuário
});

/**
 * Modelo mongoose para UserOrder utilizando o userOrderSchema.
 */
const UserOrder = mongoose.model("UserOrder", userOrderSchema);
module.exports = UserOrder;
