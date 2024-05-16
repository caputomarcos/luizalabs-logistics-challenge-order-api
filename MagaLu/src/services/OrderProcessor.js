/**
 * Responsável por processar pedidos de usuários.
 * @class
 */
class OrderProcessor {
  /**
   * Construtor para criar um pedido.
   * @param {number} userId - O ID do usuário associado ao pedido.
   * @param {string} userName - O nome do usuário associado ao pedido.
   */
  constructor(userId, userName) {
    /**
     * ID do usuário associado ao pedido.
     * @type {number}
     */
    this.userId = parseInt(userId, 10); // Convertido para inteiro com base 10 para consistência
    /**
     * Nome do usuário associado ao pedido.
     * @type {string}
     */
    this.userName = userName.trim(); // Remove espaços em branco do nome
    /**
     * Lista de pedidos do usuário.
     * @type {Array.<Object>}
     */
    this.orders = []; // Inicializa a lista de pedidos do usuário
  }

  /**
   * Adiciona um novo pedido à lista de pedidos do usuário.
   * @param {number} orderId - O ID do novo pedido.
   * @param {string} date - A data do pedido no formato AAAA-MM-DD.
   * @returns {Object} O novo pedido criado.
   */
  addOrder(orderId, date) {
    /**
     * Data formatada do pedido.
     * @type {string}
     */
    const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
    const order = {
      orderId: parseInt(orderId, 10),
      date: formattedDate,
      products: [], // Inicializa a lista de produtos no pedido
      total: 0.0, // Inicializa o total do pedido
    };
    this.orders.push(order); // Adiciona o novo pedido à lista
    return order; // Retorna o novo pedido criado
  }

  /**
   * Encontra um pedido pelo ID.
   * @param {number} orderId - O ID do pedido a ser encontrado.
   * @returns {Object|undefined} O pedido encontrado ou indefinido se não encontrado.
   */
  findOrder(orderId) {
    return this.orders.find((order) => order.orderId === parseInt(orderId, 10));
  }
}

module.exports = OrderProcessor;
