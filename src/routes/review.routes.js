const express = require('express');
const router = express.Router();
const { addReview, getListingReviews } = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, addReview);
router.get('/:listing_id', getListingReviews);

module.exports = router;