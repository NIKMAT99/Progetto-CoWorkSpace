const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', verifyToken, paymentController.createPayment);
router.get('/reservation/:id', verifyToken, paymentController.getPaymentByReservation);

module.exports = router;
