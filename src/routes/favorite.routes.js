const express = require('express');
const router = express.Router();
const { addFavorite, getMyFavorites, removeFavorite } = require('../controllers/favorite.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, addFavorite);
router.get('/', authMiddleware, getMyFavorites);
router.delete('/:listing_id', authMiddleware, removeFavorite);

module.exports = router;