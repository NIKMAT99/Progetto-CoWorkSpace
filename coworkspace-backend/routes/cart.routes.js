const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const cartCtrl = require('../controllers/cart.controller');

// Carrello: prenotazioni NON pagate dell'utente + totale
router.get('/', verifyToken, cartCtrl.getCart);

// Checkout simulato: segna tutte le NON pagate come pagate
router.post('/checkout', verifyToken, cartCtrl.checkout);

module.exports = router;
