const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', verifyToken, reservationController.createReservation);
router.get('/me', verifyToken, reservationController.getMyReservations);

module.exports = router;