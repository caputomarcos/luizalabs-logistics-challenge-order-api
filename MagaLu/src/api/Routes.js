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
 *                   type: file
 *                   format: binary
 *     responses:
 *       200:
 *         description: Lista de usuários processados a partir dos arquivos carregados.
 *       400:
 *         description: Nenhum arquivo foi carregado ou o número máximo de arquivos excedido.
 */
router.post("/upload", upload.array("file", 10), orderController.processUpload);

/**
 * @openapi
 * /memory/orders:
 *   get:
 *     summary: Obter pedidos da memória
 *     description: Retorna a lista de pedidos armazenados na memória com base nos filtros fornecidos.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: number
 *         description: ID do usuário para filtrar os pedidos.
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: number
 *         description: ID do pedido para filtrar os pedidos.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Data de início para filtrar os pedidos (formato YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Data de fim para filtrar os pedidos (formato YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Lista de pedidos da memória filtrada.
 *       404:
 *         description: Nenhum pedido encontrado com os filtros fornecidos.
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
 *           type: number
 *         description: ID do usuário para filtrar os pedidos.
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: number
 *         description: ID do pedido para filtrar os pedidos.
 *     responses:
 *       200:
 *         description: Lista de pedidos do banco de dados.
 *       400:
 *         description: Nenhum filtro foi especificado para a busca.
 *       404:
 *         description: Nenhum pedido encontrado com os filtros fornecidos.
 *       500:
 *         description: Erro ao buscar pedidos.
 */
router.get("/database/orders", async (req, res) => {
  try {
    const filters = req.query;
    let query = {};

    // Construir o objeto de consulta com base nos filtros fornecidos
    if (filters.userId) {
      query.userId = Number(filters.userId); // Filtrar por ID do usuário
    }

    if (filters.orderId) {
      // Filtrar por ID do pedido dentro do array de pedidos
      query.orders = { $elemMatch: { orderId: Number(filters.orderId) } };
    }

    // Verificar se nenhum filtro foi setado
    if (Object.keys(query).length === 0) {
      return res.status(400).json({ message: "Nenhum filtro foi especificado para a busca." });
    }

    // Buscar pedidos com base na consulta construída
    const orders = await UserOrder.find(query);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Nenhum pedido encontrado com os filtros fornecidos." });
    } else {
      res.status(200).json(orders); // Retornar os pedidos encontrados
    }
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
