const express = require('express');
const router = express.Router();
const PagamentoController = require('../controllers/pagamentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.post(
  '/pagamentos',
  authMiddleware,
  authorizeRoles('Admin','Caixa'),
  PagamentoController.realizarPagamento
);

module.exports = router;
