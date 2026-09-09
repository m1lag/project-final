const db = require('../config/db');

class FavoriteService {
  static async addFavorite(userId, listingId) {
    const result = await db.query(
      `INSERT INTO favorites (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING
       RETURNING *`,
      [userId, listingId]
    );

    return result.rows[0] || null;
  }

  static async getUserFavorites(userId) {
    const result = await db.query(
      `SELECT f.id as favorite_id, l.* 
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  static async removeFavorite(userId, listingId) {
    const result = await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING *',
      [userId, listingId]
    );

    return result.rowCount > 0;
  }
}

module.exports = FavoriteService;