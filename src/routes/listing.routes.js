const express = require('express');
const router = express.Router();
const { 
  getListings, 
  getListingById, 
  createListing, 
  updateListing, 
  deleteListing,
  getPopularDestinations
} = require('../controllers/listing.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', getListings);
router.get('/destinations', getPopularDestinations);
router.get('/:id', getListingById);

router.post('/', authMiddleware, createListing);
router.put('/:id', authMiddleware, updateListing);
router.delete('/:id', authMiddleware, deleteListing);

module.exports = router;