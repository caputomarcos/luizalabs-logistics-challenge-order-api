const MagaLu = require("../utils/LoggingExtension"); // :-)

/**
 * Middleware de logging para registrar requisições e respostas.
 *
 * @param {Object} req - O objeto de requisição.
 * @param {Object} res - O objeto de resposta.
 * @param {Function} next - A função para chamar o próximo middleware.
 */
const loggingMiddleware = (req, res, next) => {
  // Registra uma nova requisição recebida
  MagaLu.log({
    event: "loggingMiddleware",
    message: "Nova requisição recebida",
  });

  // Armazena o método original res.send
  const originalSend = res.send;

  // Substitui res.send por uma função personalizada
  res.send = function (body) {
    // Chama a função original res.send
    originalSend.call(this, body);
  };

  // Chama o próximo middleware
  next();
};

module.exports = loggingMiddleware;
