const db = require('../config/db');

class ReviewService {
  static async addReview({ listingId, userId, rating, comment }) {
    if (rating < 1 || rating > 5) {
      throw new Error('Рейтинг должен быть от 1 до 5');
    }

    const result = await db.query(
      `INSERT INTO reviews (listing_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [listingId, userId, rating, comment]
    );

    return result.rows[0];
  }

  static async getListingReviews(listingId) {
    const result = await db.query(
      `SELECT r.*, u.first_name, u.avatar_url 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.listing_id = $1
       ORDER BY r.created_at DESC`,
      [listingId]
    );
    return result.rows;
  }
}

module.exports = ReviewService;