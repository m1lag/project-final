const db = require('../config/db');

class CategoryService {
  static async getAllCategories() {
    const result = await db.query('SELECT * FROM categories ORDER BY id ASC');
    return result.rows;
  }
}

module.exports = CategoryService;