const pool = require('../../config');

const PagamentoModel = {
  async criarPagamento({ id_pedido, id_caixa, valor_pago, troco, metodo }) {
    const result = await pool.query(
      `
      INSERT INTO pagamento (id_pedido, id_caixa, valor_pago, troco, metodo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [id_pedido, id_caixa, valor_pago, troco, metodo]
    );
    return result.rows[0];
  },

  async buscarPorPedido(id_pedido) {
    const result = await pool.query(
      'SELECT * FROM pagamento WHERE id_pedido = $1',
      [id_pedido]
    );
    return result.rows[0];
  }
};

module.exports = PagamentoModel;
