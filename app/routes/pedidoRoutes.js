const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Criar pedidos
router.post(
  '/pedidos',
  authMiddleware,
  authorizeRoles('Admin','Garçom'),
  PedidoController.createPedido
);

// Listar todos pedidos
router.get(
  '/pedidos',
  authMiddleware,
  authorizeRoles('Admin','Garçom', 'Cozinha', 'Caixa'),
  PedidoController.getAllPedidos
);

// Buscar pedido por ID 
router.get(
  '/pedidos/:id',
  authMiddleware,
  authorizeRoles('Admin', 'Garçom', 'Cozinha', 'Caixa'),
  PedidoController.getPedidoById
);

// Atualizar itens → garçom (adiciona novos, não remove existentes se em preparo)
router.patch(
  '/pedidos/:id/itens',
  authMiddleware,
  authorizeRoles('Admin', 'Garçom'),
  PedidoController.updatePedidoItens
);

// Remover item → garçom (somente se status 'aberto')
router.delete(
  '/pedidos/:id/item/:id_item',
  authMiddleware,
  authorizeRoles('Admin', 'Garçom'),
  PedidoController.removeItem
);

// Atualizar status
router.patch(
  '/pedidos/:id/status',
  authMiddleware,
  authorizeRoles('Admin', 'Garçom', 'Cozinha', 'Caixa'),
  PedidoController.updateStatus
);

module.exports = router;
