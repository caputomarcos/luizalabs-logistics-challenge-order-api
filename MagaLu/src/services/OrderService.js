// services/orderService.js

const UserOrder = require("../models/UserOrder"); // Suponha que UserOrder é seu modelo Mongoose para os dados de usuário e ordens
const magaLog = require("../utils/LoggingExtension");
/**
 * Salva os dados processados no MongoDB.
 *
 * @param {Array} processedData - Os dados processados a serem salvos.
 * @returns {Promise} Uma Promise que resolve quando os dados foram salvos com sucesso ou é rejeitada se ocorrer um erro.
 */
exports.saveProcessedData = async (processedData) => {
  try {
    // Insere os dados processados no MongoDB
    await UserOrder.insertMany(processedData);

    // Registra o evento de dados processados com sucesso
    magaLog.log({
      event: "data_processed",
      message: "Dados salvos no MongoDB com sucesso.",
    });
  } catch (error) {
    // Registra o erro ao salvar os dados no MongoDB
    magaLog.error({
      event: "data_processed",
      message: "Erro ao salvar dados no MongoDB.",
      error: error,
    });

    // Propaga o erro para ser tratado pelo chamador
    throw error;
  }
};
