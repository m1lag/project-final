const express = require('express');
const router = express.Router();
const { getListings, getUserProfile } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, getUserProfile);
router.get('/listings', getListings);

module.exports = router;