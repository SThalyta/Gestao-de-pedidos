const pool = require('../../config');

const PedidoModel = {
  async criarPedido(id_mesa, id_usuario) {
    const result = await pool.query(
      `INSERT INTO pedido (id_mesa, id_usuario, data_hora, status, valor_total)
       VALUES ($1, $2, NOW(), 'aberto', 0)
       RETURNING *`,
      [id_mesa, id_usuario]
    );
    return result.rows[0];
  },

  async adicionarItem(id_pedido, id_item, quantidade, observacao, subtotal) {
    await pool.query(
      `INSERT INTO pedido_item (id_pedido, id_item, quantidade, observacao, subtotal)
       VALUES ($1, $2, $3, $4, $5)`,
      [id_pedido, id_item, quantidade, observacao, subtotal]
    );
  },

  async atualizarValorTotal(id_pedido, valor_total) {
    await pool.query(
      `UPDATE pedido SET valor_total = $1 WHERE id_pedido = $2`,
      [valor_total, id_pedido]
    );
  },

  async buscarPorId(id_pedido) {
    const result = await pool.query(
      `SELECT p.*, u.nome AS garcom, m.status AS status_mesa
       FROM pedido p
       JOIN usuario u ON p.id_usuario = u.id_usuario
       JOIN mesa m ON p.id_mesa = m.id_mesa
       WHERE p.id_pedido = $1`,
      [id_pedido]
    );
    return result.rows[0];
  },

  async buscarItens(id_pedido) {
    const result = await pool.query(
      `SELECT pi.*, c.nome_item, c.valor AS preco_unitario
       FROM pedido_item pi
       JOIN cardapio c ON pi.id_item = c.id_item
       WHERE pi.id_pedido = $1`,
      [id_pedido]
    );
    return result.rows;
  },

  async buscarTodos() {
    const result = await pool.query(`
      SELECT 
        p.id_pedido, p.data_hora, p.status, p.valor_total,
        u.nome AS garcom, m.id_mesa, m.status AS status_mesa
      FROM pedido p
      JOIN usuario u ON p.id_usuario = u.id_usuario
      JOIN mesa m ON p.id_mesa = m.id_mesa
      ORDER BY p.data_hora DESC
    `);
    return result.rows;
  },

  async atualizarStatus(id_pedido, status) {
    const result = await pool.query(
      `UPDATE pedido SET status = $1 WHERE id_pedido = $2 RETURNING *`,
      [status, id_pedido]
    );
    return result.rows[0];
  },

  async removerItem(id_pedido_item) {
    await pool.query('DELETE FROM pedido_item WHERE id_pedido_item = $1', [id_pedido_item]);
  },

  async buscarItem(id_pedido, id_item) {
    const result = await pool.query(
      `SELECT * FROM pedido_item WHERE id_pedido = $1 AND id_item = $2`,
      [id_pedido, id_item]
    );
    return result.rows[0];
  },
};

module.exports = PedidoModel;
