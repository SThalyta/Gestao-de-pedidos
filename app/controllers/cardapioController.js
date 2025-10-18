const CardapioModel = require('../models/cardapioModel');

const CardapioController = {
  // Listar itens do cardápio (público ou filtrando por categoria)
  getItens: async (req, res) => {
    try {
      const { id_categoria } = req.query;
      const itens = await CardapioModel.buscarTodos(id_categoria);
      res.json(itens);
    } catch (error) {
      console.error('Erro ao buscar itens do cardápio:', error);
      res.status(500).json({ error: 'Erro ao buscar itens do cardápio.' });
    }
  },

  // Buscar item específico
  getItemById: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await CardapioModel.buscarPorId(id);
      if (!item) return res.status(404).json({ error: 'Item não encontrado.' });
      res.json(item);
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      res.status(500).json({ error: 'Erro ao buscar item.' });
    }
  },

  // Criar novo item
  createItem: async (req, res) => {
    try {
      const novoItem = await CardapioModel.criarItem(req.body);
      res.status(201).json({ message: 'Item criado com sucesso!', item: novoItem });
    } catch (error) {
      console.error('Erro ao criar item:', error);
      res.status(500).json({ error: 'Erro ao criar item.' });
    }
  },

  // Atualizar item
  updateItem: async (req, res) => {
    try {
      const { id } = req.params;
      const itemAtualizado = await CardapioModel.atualizarItem(id, req.body);
      res.json({ message: 'Item atualizado com sucesso!', item: itemAtualizado });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      res.status(500).json({ error: 'Erro ao atualizar item.' });
    }
  },
  // Desativar item
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const itemDesativado = await CardapioModel.desativarItem(id);
      res.json({ message: 'Item desativado com sucesso!', item: itemDesativado });
    } catch (error) {
      console.error('Erro ao desativar item:', error);
      res.status(500).json({ error: 'Erro ao desativar item.' });
    }
  },
};

module.exports = CardapioController;
