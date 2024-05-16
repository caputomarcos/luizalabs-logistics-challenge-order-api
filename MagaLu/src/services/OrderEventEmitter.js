const EventEmitter = require("events");

/**
 * Classe responsável por emitir eventos relacionados a pedidos.
 * Estende a classe EventEmitter do módulo 'events'.
 */
class OrderEventEmitter extends EventEmitter {
  /**
   * Construtor da classe OrderEventEmitter.
   * Inicializa a classe e define o limite máximo de ouvintes para 30.
   * Aumenta o limite para 30 ouvintes.
   */
  constructor() {
    super();
    this.setMaxListeners(30); // Aumenta o limite para 30 ouvintes
  }
}

module.exports = new OrderEventEmitter();
