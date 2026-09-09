const db = require('../config/db');

class UserService {
  static async getUserListings(categoryId) {
    let queryText = 'SELECT * FROM listings';
    const queryParams = [];

    if (categoryId) {
      queryText += ' WHERE category_id = $1';
      queryParams.push(categoryId);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await db.query(queryText, queryParams);
    return result.rows;
  }

  static async getUserById(userId) {
    const result = await db.query(
      'SELECT id, first_name, last_name, email, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }
}

module.exports = UserService;