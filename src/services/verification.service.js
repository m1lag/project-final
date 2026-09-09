const db = require('../config/db');

class VerificationService {
  static async submitVerification({ userId, documentType, frontImageUrl, backImageUrl }) {
    const result = await db.query(
      `UPDATE users 
       SET document_type = $1,
           document_front_url = $2,
           document_back_url = $3,
           verification_status = 'verified',
           is_identity_verified = TRUE
       WHERE id = $4
       RETURNING id, first_name, last_name, email, document_type, document_front_url, document_back_url, is_identity_verified, verification_status`,
      [documentType, frontImageUrl, backImageUrl || null, userId]
    );

    return result.rows[0];
  }

  static async getVerificationStatus(userId) {
    const result = await db.query(
      'SELECT is_identity_verified, verification_status, document_type, document_front_url, document_back_url FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0];
  }
}

module.exports = VerificationService;