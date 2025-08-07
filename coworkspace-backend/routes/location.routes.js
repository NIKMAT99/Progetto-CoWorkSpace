const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/', locationController.getLocations);

router.post('/', verifyToken, locationController.createLocation);

module.exports = router;
