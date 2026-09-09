const express = require('express');
const router = express.Router();
const { submitVerification, getVerificationStatus } = require('../controllers/verification.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, submitVerification);
router.get('/status', authMiddleware, getVerificationStatus);

module.exports = router;