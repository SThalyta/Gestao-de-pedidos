const pool = require('../../config');
const PedidoModel = require('../models/pedidoModel');

const PedidoController = {
  // Criar pedido
  createPedido: async (req, res) => {
    try {
      const { id_mesa, itens } = req.body;
      const id_usuario = req.user.id;

      if (!id_mesa || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'Mesa e itens são obrigatórios.' });
      }

      // Verifica mesa
      const mesaResult = await pool.query('SELECT status FROM mesa WHERE id_mesa = $1', [id_mesa]);
      if (mesaResult.rowCount === 0) {
        return res.status(404).json({ error: 'Mesa não encontrada.' });
      }

      const { status } = mesaResult.rows[0];
      if (status !== 'livre') {
        return res.status(400).json({ error: 'Esta mesa já está ocupada ou com pedido em andamento.' });
      }

      // Cria pedido
      const pedido = await PedidoModel.criarPedido(id_mesa, id_usuario);
      let valorTotal = 0;

      for (const item of itens) {
        const { id_item, quantidade, observacao } = item;

        const cardapioResult = await pool.query(
          'SELECT valor FROM cardapio WHERE id_item = $1 AND ativo = true',
          [id_item]
        );

        if (cardapioResult.rowCount === 0) {
          return res.status(400).json({ error: `Item de cardápio ID ${id_item} não encontrado ou inativo.` });
        }

        const valor = parseFloat(cardapioResult.rows[0].valor);
        const subtotal = valor * quantidade;
        valorTotal += subtotal;

        await PedidoModel.adicionarItem(pedido.id_pedido, id_item, quantidade, observacao, subtotal);
      }

      await PedidoModel.atualizarValorTotal(pedido.id_pedido, valorTotal);
      await pool.query('UPDATE mesa SET status = $1 WHERE id_mesa = $2', ['ocupada', id_mesa]);

      res.status(201).json({
        message: 'Pedido criado com sucesso!',
        pedido: { ...pedido, valor_total: valorTotal, itens },
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Listar todos pedidos
  getAllPedidos: async (req, res) => {
    try {
      const pedidos = await PedidoModel.buscarTodos();
      res.json(pedidos);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
  },

  // Buscar pedido por ID
  getPedidoById: async (req, res) => {
    try {
      const { id } = req.params;
      const pedido = await PedidoModel.buscarPorId(id);

      if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

      const itens = await PedidoModel.buscarItens(id);
      res.json({ pedido, itens });
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
  },

  // Atualizar itens do pedido
  updatePedidoItens: async (req, res) => {
    try {
      const { id } = req.params;
      const { novos_itens } = req.body;

      if (!Array.isArray(novos_itens) || novos_itens.length === 0) {
        return res.status(400).json({ error: 'É necessário informar ao menos um item.' });
      }

      const pedido = await PedidoModel.buscarPorId(id);
      if (!pedido) throw new Error('Pedido não encontrado.');

      for (const item of novos_itens) {
        const { id_item, quantidade, observacao } = item;

        const cardapioResult = await pool.query(
          'SELECT valor FROM cardapio WHERE id_item = $1 AND ativo = true',
          [id_item]
        );

        if (cardapioResult.rowCount === 0) {
          throw new Error(`Item de cardápio ID ${id_item} não encontrado ou inativo.`);
        }

        const preco = parseFloat(cardapioResult.rows[0].valor);
        const subtotal = parseFloat((preco * quantidade).toFixed(2));

        const existente = await PedidoModel.buscarItem(id, id_item);

        if (existente) {
          if (pedido.status === 'em_preparo') continue;

          const novaQuantidade = existente.quantidade + quantidade;
          const novoSubtotal = parseFloat((preco * novaQuantidade).toFixed(2));

          await pool.query(
            `UPDATE pedido_item
             SET quantidade=$1, subtotal=$2, observacao=$3
             WHERE id_pedido=$4 AND id_item=$5`,
            [novaQuantidade, novoSubtotal, observacao || existente.observacao, id, id_item]
          );
        } else {
          await PedidoModel.adicionarItem(id, id_item, quantidade, observacao, subtotal);
        }
      }

      const itensAtualizados = await PedidoModel.buscarItens(id);
      const novoValorTotal = parseFloat(
        itensAtualizados.reduce((acc, item) => acc + parseFloat(item.subtotal), 0).toFixed(2)
      );

      await PedidoModel.atualizarValorTotal(id, novoValorTotal);

      res.json({
        message: 'Itens do pedido atualizados com sucesso!',
        pedido: {
          id_pedido: id,
          valor_total: novoValorTotal.toFixed(2),
          itens: itensAtualizados,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar itens:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Remover item
  removeItem: async (req, res) => {
    try {
      const { id, id_item } = req.params;

      const pedido = await PedidoModel.buscarPorId(id);
      if (!pedido) throw new Error('Pedido não encontrado.');
      if (pedido.status !== 'aberto') throw new Error('Não é permitido remover itens após envio para cozinha.');

      const item = await PedidoModel.buscarItem(id, id_item);
      if (!item) throw new Error('Item não encontrado neste pedido.');

      await PedidoModel.removerItem(item.id_pedido_item);

      const novoTotal = pedido.valor_total - item.subtotal;
      await PedidoModel.atualizarValorTotal(id, novoTotal);

      const itensAtualizados = await PedidoModel.buscarItens(id);

      res.json({
        message: 'Item removido com sucesso!',
        pedido: { id_pedido: id, valor_total: novoTotal, itens: itensAtualizados },
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Atualizar status
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const statusPermitidos = ['aberto', 'em_preparo', 'entregue', 'finalizado', 'cancelado'];
      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
      }

      const pedidoAtualizado = await PedidoModel.atualizarStatus(id, status);
      if (!pedidoAtualizado) return res.status(404).json({ error: 'Pedido não encontrado.' });

      if (['finalizado', 'cancelado'].includes(status)) {
        await pool.query(
          `UPDATE mesa SET status='livre' WHERE id_mesa=(SELECT id_mesa FROM pedido WHERE id_pedido=$1)`,
          [id]
        );
      }

      res.json({ message: 'Status atualizado com sucesso!', pedido: pedidoAtualizado });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = PedidoController;
