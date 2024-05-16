// Import statements
const fs = require("fs").promises;
const { users: Users } = require("../models/User");
const Order = require("./OrderProcessor");
const HashUtils = require("../utils/HashUtils");
const HashManager = require("../managers/HashManager");
const OrderEventEmitter = require("./OrderEventEmitter");
const MagaLog = require("../utils/LoggingExtension");

// Environment variables
const STORAGE_FILE_HASHES = process.env.STORAGE_FILE_HASHES;
const STORAGE_LINE_HASHES = process.env.STORAGE_LINE_HASHES;

// Initialize Hash Manager
const hashManager = new HashManager(STORAGE_FILE_HASHES, STORAGE_LINE_HASHES);

/**
 * Inicializa o hash manager carregando os hashes salvos.
 */
async function initHashManagers() {
  try {
    await hashManager.loadHashes();
    MagaLog.log({ event: "hashManagers_initialized" });
  } catch (error) {
    MagaLog.error("Error initializing hash managers:", error);
    throw error;
  }
}

/**
 * Processa arquivos carregados e extrai dados de usuários.
 * @param {Array} files Arquivos a serem processados.
 * @param {Set} newFileHashes - Conjunto para acumular novos hashes de arquivo.
 * @param {Set} newLineHashes - Conjunto para acumular novos hashes de linha.
 * @returns {Promise<Array>} Lista de todos os usuários processados.
 */
async function processUploadedFiles(files, newFileHashes, newLineHashes) {
  MagaLog.log({
    event: "processUploadedFiles_start",
    filesCount: files.length,
  });

  let allUsers = [];

  for (const file of files) {
    MagaLog.log({ event: "processing_file_start", filePath: file.path });
    try {
      const data = await fs.readFile(file.path, "utf8");
      MagaLog.log({ event: "file_read", filePath: file.path });

      if (!data) {
        MagaLog.log({
          event: "file_is_empty_skipping",
          error: `File ${file.path} is empty`,
        });
        continue;
      }

      const fileHash = HashUtils.getFileHash(data);
      if (hashManager.hasFileHash(fileHash) || newFileHashes.has(fileHash)) {
        MagaLog.log({
          event: "skipping_duplicated_file",
          path: file.path,
          filename: file.filename,
          hash: fileHash,
        });
        continue;
      }

      newFileHashes.add(fileHash);
      const usersFromData = parseLegacyData(data, newLineHashes);
      allUsers = allUsers.concat(usersFromData);
      const deleteFiles = process.env.DELETE_FILES || "true";
      if (deleteFiles === "true") {
        await fs.unlink(file.path);
      }
      MagaLog.log({ event: "file_processed", filePath: file.path });
    } catch (error) {
      MagaLog.error({
        event: "error_processing_file",
        filePath: file.path,
        errorMessage: error.message,
      });
    }
  }

  MagaLog.log({
    event: "processUploadedFiles_end",
    totalProcessedUsers: allUsers.length,
  });

  return allUsers;
}

/**
 * Processa dados legados de texto, criando e atualizando objetos de ordem para cada linha válida.
 * Esta função lê cada linha de dados, cria um hash para verificar duplicatas, e processa a linha se ela for única.
 *
 * @param {string} data - Dados em formato de texto, onde cada linha representa uma ordem.
 * @param {Set} newLineHashes - Conjunto para acumular novos hashes de linha.
 * @returns {Array} Uma lista de objetos de usuário, com suas ordens e produtos atualizados.
 */
function parseLegacyData(data, newLineHashes) {
  MagaLog.log({ event: "parseLegacyData_start", dataLength: data.length });

  const lines = data.split("\n");
  let processedCount = 0;

  const results = lines.reduce((acc, line, index) => {
    if (line.trim()) {
      const lineHash = HashUtils.getFileHash(line);
      if (hashManager.hasLineHash(lineHash) || newLineHashes.has(lineHash)) {
        MagaLog.log({
          event: "skipping_duplicated_line",
          lineHash,
          lineContent: line,
        });
        return acc;
      }

      newLineHashes.add(lineHash);

      const [userId, userName, orderId, prodId, value, date] =
        extractData(line);
      updateOrCreateOrder(userId, userName, orderId, prodId, value, date);
      acc.push(Users[userId]);

      MagaLog.log({
        event: "line_processed",
        lineNumber: index + 1,
        lineHash,
        lineContent: line,
        user: Users[userId],
      });
      processedCount++;
    }
    return acc;
  }, []);

  MagaLog.log({
    event: "parseLegacyData_end",
    processedLines: processedCount,
    totalLines: lines.length,
  });

  return results;
}

/**
 * Extrai os dados de uma linha de dados de ordem.
 *
 * @param {string} line - A linha de dados de ordem.
 * @returns {Array} - Um array contendo os dados extraídos:
 *   - O ID do usuário (string).
 *   - O nome do usuário (string).
 *   - O ID da ordem (número).
 *   - O ID do produto (número).
 *   - O valor do produto (número).
 *   - A data da ordem no formato "AAAA-MM-DD" (string).
 */
function extractData(line) {
  const userId = line.substring(0, 10).trim();
  const userName = line.substring(10, 55).trim();
  const orderId = parseInt(line.substring(55, 65).trim(), 10);
  const prodId = parseInt(line.substring(65, 75).trim(), 10);
  const value = parseFloat(line.substring(75, 87).trim());
  const date = line.substring(87, 95);
  MagaLog.log({ "extracted_date:": date });
  return [userId, userName, orderId, prodId, value, date];
}

/**
 * Cria ou atualiza uma ordem para um usuário.
 *
 * @param {string} userId - O ID do usuário.
 * @param {string} userName - O nome do usuário.
 * @param {number} orderId - O ID da ordem.
 * @param {number} prodId - O ID do produto.
 * @param {number} value - O valor do produto.
 * @param {string} date - A data da ordem no formato "AAAA-MM-DD".
 * @return {void} Nada é retornado.
 */
function updateOrCreateOrder(userId, userName, orderId, prodId, value, date) {
  if (!Users[userId]) {
    Users[userId] = new Order(userId, userName);
  }

  let order = Users[userId].findOrder(orderId);
  if (!order) {
    order = Users[userId].addOrder(orderId, date);
  }

  order.products.push({ productId: prodId, value: value.toFixed(2) });
  order.total += value;
  order.total = parseFloat(order.total.toFixed(2));

  // Emitir o evento com o objeto de ordem completo'
  OrderEventEmitter.emit("orderUpdated", order);
}

/**
 * Salva os hashes acumulados.
 * @param {Set} newFileHashes - Conjunto de novos hashes de arquivo.
 * @param {Set} newLineHashes - Conjunto de novos hashes de linha.
 */
async function saveHashes(newFileHashes, newLineHashes) {
  try {
    await hashManager.addHashes(newFileHashes, newLineHashes);
  } catch (error) {
    MagaLog.error("Error saving file/line hashes:", error);
  }
}

/**
 * Registra um listener para ser notificado quando um pedido for atualizado.
 * @param {Function} listener - Função a ser chamada quando um pedido for atualizado.
 * @returns {void} Nada é retornado.
 */
exports.onOrderUpdated = (listener) => {
  // Adiciona o listener ao evento de atualização de pedido
  OrderEventEmitter.on("orderUpdated", listener);
};

/**
 * Remove um listener previamente registrado para atualizações de pedido.
 * @param {Function} listener - Listener a ser removido.
 * @returns {void} Nada é retornado.
 */
exports.removeOrderListener = (listener) => {
  // Remove o listener do evento de atualização de pedido
  OrderEventEmitter.removeListener("orderUpdated", listener);
};

/**
 * Filtra as ordens com base nos parâmetros fornecidos.
 * @param {Object} params - Parâmetros para filtragem das ordens.
 * @param {string} params.userId - ID do usuário para filtragem.
 * @param {string} params.orderId - ID do pedido para filtragem.
 * @param {string} params.startDate - Data de início para filtragem.
 * @param {string} params.endDate - Data de término para filtragem.
 * @returns {Array} Um array contendo as ordens filtradas.
 */
const filterOrders = ({ userId, orderId, startDate, endDate }) => {
  // Filtra as ordens com base nos parâmetros fornecidos
  return Object.values(Users).filter((user) => {
    return user.orders.some((order) => {
      const orderDate = new Date(order.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      return (
        (!userId || user.userId === parseInt(userId, 10)) &&
        (!orderId || order.orderId === parseInt(orderId, 10)) &&
        (!startDate || (start && orderDate >= start)) &&
        (!endDate || (end && orderDate <= end))
      );
    });
  });
};

module.exports = {
  filterOrders,
  processUploadedFiles,
  parseLegacyData,
  extractData,
  updateOrCreateOrder,
  onOrderUpdated: exports.onOrderUpdated,
  removeOrderListener: exports.removeOrderListener,
  initHashManagers,
  saveHashes,
};
