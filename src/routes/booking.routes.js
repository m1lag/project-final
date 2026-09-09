const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getOccupiedDates } = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth');

router.get('/occupied/:listing_id', getOccupiedDates);
router.post('/', authMiddleware, createBooking);
router.get('/my', authMiddleware, getUserBookings);

module.exports = router;