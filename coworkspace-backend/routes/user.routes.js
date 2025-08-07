const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/me', verifyToken, userController.getMe);
router.put('/me', verifyToken, userController.updateMe);
router.delete('/me', verifyToken, userController.deleteMe);

module.exports = router;