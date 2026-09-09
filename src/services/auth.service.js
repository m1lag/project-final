const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  static generateToken(id, email) {
    return jwt.sign(
      { id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static async registerUser({ first_name, last_name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (userExists.rows.length > 0) {
      throw new Error('USER_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, first_name, last_name, email, is_host, avatar_url, phone, bio, is_email_verified, is_identity_verified, created_at`,
      [first_name.trim(), last_name.trim(), normalizedEmail, password_hash]
    );

    const user = newUser.rows[0];
    const token = this.generateToken(user.id, user.email);

    return { token, user };
  }

  static async loginUser(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    delete user.password_hash;
    const token = this.generateToken(user.id, user.email);

    return { token, user };
  }

  static async getUserProfile(userId) {
    const result = await db.query(
      'SELECT id, first_name, last_name, email, is_host, avatar_url, phone, bio, is_email_verified, is_identity_verified, created_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  }

  static async updateUserProfile(userId, { first_name, last_name, phone, avatar_url, bio }) {
    const updatedUser = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           avatar_url = COALESCE($4, avatar_url),
           bio = COALESCE($5, bio)
       WHERE id = $6
       RETURNING id, first_name, last_name, email, is_host, avatar_url, phone, bio, is_email_verified, is_identity_verified, created_at`,
      [first_name, last_name, phone, avatar_url, bio, userId]
    );
    return updatedUser.rows[0];
  }
}

module.exports = AuthService;