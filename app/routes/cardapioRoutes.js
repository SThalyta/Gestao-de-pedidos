const express = require('express');
const router = express.Router();
const CardapioController = require('../controllers/cardapioController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.get('/cardapio', CardapioController.getItens);

router.get('/cardapio/:id', CardapioController.getItemById);

router.post(
  '/cardapio',
  authMiddleware,
  authorizeRoles('Admin'),
  CardapioController.createItem
);

router.patch(
  '/cardapio/:id',
  authMiddleware,
  authorizeRoles('Admin'),
  CardapioController.updateItem
);

router.delete(
  '/cardapio/:id',
  authMiddleware,
  authorizeRoles('Admin'),
  CardapioController.deleteItem
);

module.exports = router;
