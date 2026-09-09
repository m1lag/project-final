const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');

router.post('/process', authMiddleware, processPayment);

module.exports = router;