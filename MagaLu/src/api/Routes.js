const express = require("express");
const orderController = require("../controllers/OrderController");
const upload = require("../services/FileService").upload;
const UserOrder = require("../models/UserOrder");

const router = express.Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Carregar e processar múltiplos arquivos
 *     description: Permite o carregamento de múltiplos arquivos, processando-os e retornando os resultados agregados.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Lista de usuários processados a partir dos arquivos carregados.
 *       400:
 *         description: Nenhum arquivo foi carregado.
 */
router.post("/upload", upload.array("file", 10), orderController.processUpload);

/**
 * @openapi
 * /memory/orders:
 *   get:
 *     summary: Obter pedidos da memória
 *     description: Retorna a lista de pedidos armazenados na memória.
 *     responses:
 *       200:
 *         description: Lista de pedidos da memória.
 *       404:
 *         description: Nenhum pedido encontrado na memória.
 */
router.get("/memory/orders", orderController.getOrders);

/**
 * @openapi
 * /database/orders:
 *   get:
 *     summary: Obter pedidos do banco de dados
 *     description: Retorna a lista de pedidos armazenados no banco de dados com base nos filtros fornecidos.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID do usuário para filtrar os pedidos.
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: ID do pedido para filtrar os pedidos.
 *     responses:
 *       200:
 *         description: Lista de pedidos do banco de dados.
 *       500:
 *         description: Erro ao buscar pedidos.
 */
router.get("/database/orders", async (req, res) => {
  try {
    const filters = req.query;
    let query = {};

    // Construir o objeto de consulta com base nos filtros fornecidos
    if (filters.userId) {
      query.userId = filters.userId; // Filtrar por ID do usuário
    }

    // Adicionar mais condições conforme necessário com base nos campos disponíveis no modelo
    if (filters.orderId) {
      query["orders.orderId"] = filters.orderId; // Filtrar por ID do pedido
    }

    // Buscar pedidos com base na consulta construída
    const orders = await UserOrder.find(query); // Usar find() sem argumentos retorna todos os documentos
    res.status(200).json(orders); // Retornar os pedidos encontrados
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error); // Log de erro ao buscar pedidos
    res.status(500).json({ error: "Erro ao buscar pedidos" }); // Retornar erro ao buscar pedidos
  }
});

/**
 * @openapi
 * /stream-orders:
 *   get:
 *     summary: Transmitir pedidos em tempo real
 *     description: Envia os pedidos em tempo real por meio de streaming.
 *     responses:
 *       200:
 *         description: Pedidos transmitidos com sucesso.
 *       400:
 *         description: Erro ao transmitir pedidos.
 */
router.get("/stream-orders", orderController.streamOrders);

module.exports = router;
