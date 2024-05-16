const crypto = require("crypto");

/**
 * Gera um hash SHA-256 para os dados fornecidos.
 * Esta função é útil para criar uma assinatura única de strings ou conteúdos,
 * que pode ser usada para verificar a integridade dos dados ou para hashing de propósitos leves.
 *
 * @param {string} data - Dados para os quais o hash deve ser gerado.
 * @returns {string} O hash SHA-256 dos dados.
 */
const getHash = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

module.exports = { getFileHash: getHash };
