const pool = require('../../config');

const CardapioModel = {
  // Buscar todos os itens ativos, opcional por categoria
  async buscarTodos(id_categoria = null) {
    let query = `
      SELECT c.id_item, c.nome_item, c.descricao, c.valor, c.ativo,
             cat.id_categoria, cat.nome_categoria
      FROM cardapio c
      JOIN categoria cat ON c.id_categoria = cat.id_categoria
      WHERE c.ativo = true
    `;
    const params = [];
    if (id_categoria) {
      query += ' AND c.id_categoria = $1';
      params.push(id_categoria);
    }
    query += ' ORDER BY c.nome_item';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Buscar item por ID
  async buscarPorId(id_item) {
    const result = await pool.query(
      `
      SELECT c.id_item, c.nome_item, c.descricao, c.valor, c.ativo,
             cat.id_categoria, cat.nome_categoria
      FROM cardapio c
      JOIN categoria cat ON c.id_categoria = cat.id_categoria
      WHERE c.id_item = $1
      `,
      [id_item]
    );
    return result.rows[0];
  },

  // Criar novo item
  async criarItem({ nome_item, descricao, valor, id_categoria, ativo = true }) {
    const result = await pool.query(
      `
      INSERT INTO cardapio (nome_item, descricao, valor, id_categoria, ativo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [nome_item, descricao, valor, id_categoria, ativo]
    );
    return result.rows[0];
  },

    // Atualizar item
    async atualizarItem(id_item, dados) {
    const campos = [];
    const valores = [];
    let idx = 1;

    if (dados.nome_item !== undefined) {
        campos.push(`nome_item = $${idx++}`);
        valores.push(dados.nome_item);
    }
    if (dados.descricao !== undefined) {
        campos.push(`descricao = $${idx++}`);
        valores.push(dados.descricao);
    }
    if (dados.valor !== undefined) {
        campos.push(`valor = $${idx++}`);
        valores.push(dados.valor);
    }
    if (dados.id_categoria !== undefined) {
        campos.push(`id_categoria = $${idx++}`);
        valores.push(dados.id_categoria);
    }
    if (dados.ativo !== undefined) {
        campos.push(`ativo = $${idx++}`);
        valores.push(dados.ativo);
    }

    if (campos.length === 0) return this.buscarPorId(id_item);

    valores.push(id_item);

    const query = `
        UPDATE cardapio
        SET ${campos.join(', ')}
        WHERE id_item = $${idx}
        RETURNING *
    `;

    const result = await pool.query(query, valores);
    return result.rows[0];
    },

  // Desativar item
  async desativarItem(id_item) {
    const result = await pool.query(
      'UPDATE cardapio SET ativo = false WHERE id_item = $1 RETURNING *',
      [id_item]
    );
    return result.rows[0];
  },
};

module.exports = CardapioModel;
