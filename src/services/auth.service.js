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

    await db.query(
      `INSERT INTO user_profiles (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

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
    `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.is_host,
        u.avatar_url,
        u.phone,
        u.bio,
        u.is_email_verified,
        u.is_identity_verified,
        u.created_at,

        up.education,
        up.profession,
        up.residence,
        up.languages,
        up.birth_decade,
        up.favorite_song,
        up.biggest_hobby,
        up.interesting_fact,
        up.useless_skills,
        up.bio_title,
        up.time_spent,
        up.pets

      FROM users u

      LEFT JOIN user_profiles up
        ON up.user_id = u.id

      WHERE u.id = $1
    `,
    [userId]
  );

  return result.rows[0];
}

  static async updateUserProfile(userId, data) {
  const {
    first_name,
    last_name,
    phone,
    avatar_url,
    bio,

    education,
    profession,
    residence,
    languages,
    birth_decade,
    favorite_song,
    biggest_hobby,
    interesting_fact,
    useless_skills,
    bio_title,
    time_spent,
    pets,
    favorite_interests,
  } = data

  await db.query(
    `
      UPDATE users
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        avatar_url = COALESCE($4, avatar_url),
        bio = CASE
          WHEN $5::text IS NOT NULL THEN $5
          ELSE bio
        END
      WHERE id = $6
    `,
    [
      first_name ?? null,
      last_name ?? null,
      phone ?? null,
      avatar_url ?? null,
      bio !== undefined ? bio : null,
      userId,
    ]
  )

  const hasProfileFields =
    education !== undefined ||
    profession !== undefined ||
    residence !== undefined ||
    languages !== undefined ||
    birth_decade !== undefined ||
    favorite_song !== undefined ||
    biggest_hobby !== undefined ||
    interesting_fact !== undefined ||
    useless_skills !== undefined ||
    bio_title !== undefined ||
    time_spent !== undefined ||
    pets !== undefined ||
    favorite_interests !== undefined

  if (hasProfileFields) {
    await db.query(
      `
        INSERT INTO user_profiles (
          user_id,
          education,
          profession,
          residence,
          languages,
          birth_decade,
          favorite_song,
          biggest_hobby,
          interesting_fact,
          useless_skills,
          bio_title,
          time_spent,
          pets,
          favorite_interests
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          education = CASE
            WHEN $2::text IS NOT NULL
              THEN $2
            ELSE user_profiles.education
          END,

          profession = CASE
            WHEN $3::text IS NOT NULL
              THEN $3
            ELSE user_profiles.profession
          END,

          residence = CASE
            WHEN $4::text IS NOT NULL
              THEN $4
            ELSE user_profiles.residence
          END,

          languages = CASE
            WHEN $5::text IS NOT NULL
              THEN $5
            ELSE user_profiles.languages
          END,

          birth_decade = CASE
            WHEN $6::text IS NOT NULL
              THEN $6
            ELSE user_profiles.birth_decade
          END,

          favorite_song = CASE
            WHEN $7::text IS NOT NULL
              THEN $7
            ELSE user_profiles.favorite_song
          END,

          biggest_hobby = CASE
            WHEN $8::text IS NOT NULL
              THEN $8
            ELSE user_profiles.biggest_hobby
          END,

          interesting_fact = CASE
            WHEN $9::text IS NOT NULL
              THEN $9
            ELSE user_profiles.interesting_fact
          END,

          useless_skills = CASE
            WHEN $10::text IS NOT NULL
              THEN $10
            ELSE user_profiles.useless_skills
          END,

          bio_title = CASE
            WHEN $11::text IS NOT NULL
              THEN $11
            ELSE user_profiles.bio_title
          END,

          time_spent = CASE
            WHEN $12::text IS NOT NULL
              THEN $12
            ELSE user_profiles.time_spent
          END,

          pets = CASE
            WHEN $13::text IS NOT NULL
              THEN $13
            ELSE user_profiles.pets
          END,

          favorite_interests = CASE
            WHEN $14 IS NOT NULL
              THEN $14
            ELSE user_profiles.favorite_interests
          END,

          updated_at = CURRENT_TIMESTAMP
      `,
      [
        userId,
        education ?? null,
        profession ?? null,
        residence ?? null,
        languages ?? null,
        birth_decade ?? null,
        favorite_song ?? null,
        biggest_hobby ?? null,
        interesting_fact ?? null,
        useless_skills ?? null,
        bio_title ?? null,
        time_spent ?? null,
        pets ?? null,
        favorite_interests ?? null,
      ]
    )
  }



  const result = await db.query(
    `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.is_host,
        u.avatar_url,
        u.phone,
        u.bio,
        u.is_email_verified,
        u.is_identity_verified,
        u.created_at,

        up.education,
        up.profession,
        up.residence,
        up.languages,
        up.birth_decade,
        up.favorite_song,
        up.biggest_hobby,
        up.interesting_fact,
        up.useless_skills,
        up.bio_title,
        up.time_spent,
        up.pets,
        up.favorite_interests

      FROM users u

      LEFT JOIN user_profiles up
        ON up.user_id = u.id

      WHERE u.id = $1
    `,
    [userId]
  )

  return result.rows[0]
}
}

module.exports = AuthService;