const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.get('/check', availabilityController.checkAvailability);
router.get('/slots', availabilityController.getAvailableSlots);
router.get('/getSpaceReservations', availabilityController.getSpaceReservations);

module.exports = router;