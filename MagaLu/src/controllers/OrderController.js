const OrderPorcessingService = require("../services/OrderProcessingService");
const OrderService = require("../services/OrderService");
const MagaLu = require("../utils/LoggingExtension");

/**
 * Processa o upload de arquivos.
 *
 * @param {Object} req - O objeto de requisição.
 * @param {Object} res - O objeto de resposta.
 */
exports.processUpload = async (req, res) => {
  // Verifica se há arquivos para upload
  if (!req.files || req.files.length === 0) {
    MagaLu.log({ event: "no_files_uploaded" });
    return res.status(400).send({ error: "Nenhum arquivo foi enviado." });
  }

  // Registra o início do processamento do upload
  MagaLu.log({ event: "processUpload_start", files: req.files });

  // Inicializa os conjuntos de hashes de arquivos e linhas
  const newFileHashes = new Set();
  const newLineHashes = new Set();

  try {
    // Processa os arquivos enviados
    const users = await OrderPorcessingService.processUploadedFiles(
      req.files,
      newFileHashes,
      newLineHashes,
    );
    // Registra o fim do processamento do upload e os usuários processados
    MagaLu.log({ event: "processUpload_end", users });
    res.status(200).send(users);
    // Salva os hashes dos novos arquivos e linhas
    const duplicityCheck = process.env.DUPLICITY_CHECK || "true";
    if (duplicityCheck === "true" && users.length > 0) {
      MagaLu.error(
        "Salvar hashes ao processar arquivos:",
        process.env.DUPLICITY_CHECK,
      );
      await OrderPorcessingService.saveHashes(newFileHashes, newLineHashes);
    }
    // Salva os dados processados no MongoDB
    const saveData = process.env.SAVE_DATA || "true";
    if (saveData === "true" && users.length > 0) {
      await OrderService.saveProcessedData(users);
    }
  } catch (error) {
    // Registra o erro de processamento de arquivos
    MagaLu.error("Erro ao processar arquivos:", error);
    res.status(500).send({ error: "Falha ao processar os arquivos enviados." });
  }
};

/**
 * Retorna as ordens baseadas nos parâmetros fornecidos.
 *
 * @param {Object} req - O objeto de requisição contendo os parâmetros de filtro.
 * @param {Object} res - O objeto de resposta.
 */
exports.getOrders = (req, res) => {
  // Registra o evento de busca de ordens juntamente com os parâmetros de consulta
  MagaLu.log({ event: "getOrders", query: req.query });

  // Extrai os parâmetros de consulta da requisição
  const { userId, orderId, startDate, endDate } = req.query;

  // Filtra as ordens com base nos parâmetros fornecidos
  const filteredOrders = OrderPorcessingService.filterOrders({
    userId,
    orderId,
    startDate,
    endDate,
  });

  // Verifica se alguma ordem foi encontrada
  if (filteredOrders.length === 0) {
    // Registra que nenhuma ordem foi encontrada com os critérios informados
    MagaLu.log({
      event: "no_orders_found",
      message: "Nenhuma ordem foi encontrada correspondente aos critérios.",
    });
  }

  // Registra as ordens filtradas após o processo de filtragem
  MagaLu.log({ event: "filteredOrders", filteredOrders });

  // Envia as ordens filtradas como resposta com status 200
  res.status(200).send(filteredOrders);
};

/**
 * Inicia um streaming de ordens para o cliente através de Server-Sent Events (SSE).
 *
 * @param {Object} req - O objeto de requisição do cliente.
 * @param {Object} res - O objeto de resposta do servidor.
 */
exports.streamOrders = (req, res) => {
  // Configura o cabeçalho da resposta para indicar que é um evento de streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  /**
   * Envia um evento de ordem para o cliente.
   *
   * @param {Object} order - A ordem a ser enviada.
   */
  const sendEvent = (order) => {
    if (!res.finished) {
      res.write(`data: ${JSON.stringify(order)}\n\n`);
    }
  };

  // Inicia um intervalo para enviar um evento vazio a cada 20 segundos para manter a conexão ativa
  const orderId = setInterval(() => {
    if (res.finished) {
      clearInterval(orderId);
      OrderPorcessingService.removeOrderListener(sendEvent);
    } else {
      res.write(": keep-alive\n\n");
    }
  }, 20000);

  // Registra o ouvinte para atualizações de ordens
  OrderPorcessingService.onOrderUpdated(sendEvent);

  // Evento disparado quando a conexão é fechada pelo cliente
  req.on("close", () => {
    clearInterval(orderId);
    OrderPorcessingService.removeOrderListener(sendEvent);
    res.end();
  });
};
