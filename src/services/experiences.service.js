const db = require('../config/db');

class ExperiencesService {
  static async getAllExperiences() {
    const result = await db.query(
      'SELECT * FROM experiences ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

module.exports = ExperiencesService;