const ReviewService = require('../services/review.service');

const addReview = async (req, res) => {
  try {
    const { listing_id, rating, comment } = req.body;

    if (!listing_id || !rating) {
      return res.status(400).json({ error: 'Укажите ID жилья и оценку' });
    }

    const review = await ReviewService.addReview({
      listingId: listing_id,
      userId: req.user.id,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.message === 'Рейтинг должен быть от 1 до 5') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Ошибка при добавлении отзыва:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getListingReviews = async (req, res) => {
  try {
    const { listing_id } = req.params;
    const reviews = await ReviewService.getListingReviews(listing_id);
    res.json(reviews);
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  addReview,
  getListingReviews
};