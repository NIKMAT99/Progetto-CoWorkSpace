const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/space.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/', spaceController.getSpaces);
router.post('/', verifyToken, spaceController.createSpace);

module.exports = router;
