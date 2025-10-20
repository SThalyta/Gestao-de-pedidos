const pool = require('../../config');
const PagamentoModel = require('../models/pagamentoModel');
const PedidoModel = require('../models/pedidoModel');

const PagamentoController = {
  async realizarPagamento(req, res) {
    try {
      const { id_pedido, valor_pago, metodo } = req.body;
      const id_caixa = req.user.id; 

      const pedido = await PedidoModel.buscarPorId(id_pedido);
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado.' });
      }

      if (pedido.status === 'finalizado') {
        return res.status(400).json({ erro: 'Pedido já foi finalizado' });
      }

      const troco = parseFloat(valor_pago) - parseFloat(pedido.valor_total);
      if (troco < 0) {
        return res.status(400).json({ message: 'Valor pago insuficiente.' });
      }

      const pagamento = await PagamentoModel.criarPagamento({
        id_pedido,
        id_caixa,
        valor_pago,
        troco,
        metodo
      });

      await PedidoModel.atualizarStatus(id_pedido, 'finalizado');
      await pool.query(`UPDATE mesa SET status = 'livre' WHERE id_mesa = $1`, [pedido.id_mesa]);

      res.status(201).json({
        message: 'Pagamento realizado com sucesso.',
        pagamento
      });
    } catch (error) {
      console.error('Erro ao realizar pagamento:', error);
      res.status(500).json({ message: 'Erro ao processar pagamento.', error });
    }
  }
};

module.exports = PagamentoController;
