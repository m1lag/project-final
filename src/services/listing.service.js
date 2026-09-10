const db = require('../config/db');

const formatDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return null;
  }

  const months = [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня'
  ];

  const getDateParts = (value) => {
    if (value instanceof Date) {
      return {
        year: value.getUTCFullYear(),
        month: value.getUTCMonth() + 1,
        day: value.getUTCDate()
      };
    }

    const [year, month, day] = String(value)
      .split('T')[0]
      .split('-')
      .map(Number);

    return { year, month, day };
  };

  const from = getDateParts(checkIn);
  const to = getDateParts(checkOut);

  if (
    !from.year || !from.month || !from.day ||
    !to.year || !to.month || !to.day
  ) {
    return null;
  }

  if (from.month === to.month && from.year === to.year) {
    return `${from.day}-${to.day} ${months[from.month - 1]}`;
  }

  return `${from.day} ${months[from.month - 1]} - ${to.day} ${months[to.month - 1]}`;
};


class ListingService {
  static async getAllListings(queryParamsData) {
    const { category_id, city, min_price, max_price, guests, check_in, check_out, page = 1, limit = 12 } = queryParamsData;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT l.*, c.name as category_name,
             COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
             COUNT(r.id)::int as reviews_count
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE 1=1
    `;
    const queryParams = [];

    if (category_id) {
      queryParams.push(category_id);
      queryText += ` AND l.category_id = $${queryParams.length}`;
    }

    if (city) {
      queryParams.push(`%${city}%`);
      queryText += ` AND l.location_city ILIKE $${queryParams.length}`;
    }

    if (min_price) {
      queryParams.push(min_price);
      queryText += ` AND l.price_per_night >= $${queryParams.length}`;
    }

    if (max_price) {
      queryParams.push(max_price);
      queryText += ` AND l.price_per_night <= $${queryParams.length}`;
    }

    if (guests) {
      queryParams.push(guests);
      queryText += ` AND l.max_guests >= $${queryParams.length}`;
    }

    if (check_in && check_out) {
      queryParams.push(check_in, check_out);

      const checkInParam = queryParams.length - 1;
      const checkOutParam = queryParams.length;

      queryText += `
        AND l.available_from <= $${checkInParam}
        AND l.available_to >= $${checkOutParam}

        AND l.id NOT IN (
          SELECT listing_id
          FROM bookings
          WHERE status != 'cancelled'
            AND (
              check_in < $${checkOutParam}
              AND check_out > $${checkInParam}
            )
        )
      `;
    }

    queryText += ` GROUP BY l.id, c.name ORDER BY l.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await db.query(queryText, queryParams);

    return result.rows.map((listing) => ({
      ...listing,
      date_range: formatDateRange(
        listing.available_from,
        listing.available_to
      )
    }));
  }

  static async getListingById(id) {
    const listingResult = await db.query(
      `SELECT 
        l.*, 
        c.name as category_name,
        u.first_name as host_name,
        u.avatar_url as host_avatar,
        u.created_at as host_joined,
        u.is_identity_verified as host_verified,
        COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
        COUNT(r.id)::int as reviews_count
       FROM listings l
       LEFT JOIN categories c ON l.category_id = c.id
       LEFT JOIN users u ON l.host_id = u.id
       LEFT JOIN reviews r ON l.id = r.listing_id
       WHERE l.id = $1
       GROUP BY l.id, c.name, u.id`,
      [id]
    );

    if (listingResult.rows.length === 0) {
      return null;
    }

    const reviewsResult = await db.query(
      `SELECT r.*, u.first_name, u.avatar_url 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.listing_id = $1
       ORDER BY r.created_at DESC
       LIMIT 6`,
      [id]
    );

    const listing = listingResult.rows[0];
    listing.reviews = reviewsResult.rows;

    return listing;
  }

  static async createListing(data, hostId) {
    const { 
      title, description, price_per_night, location_city, location_country, 
      category_id, images, max_guests, bedrooms, beds, bathrooms, 
      amenities, rules, latitude, longitude, address, getting_around 
    } = data;

    const newListing = await db.query(
      `INSERT INTO listings (
        title, description, price_per_night, location_city, location_country, 
        category_id, images, host_id, max_guests, bedrooms, beds, bathrooms, 
        amenities, rules, latitude, longitude, address, getting_around
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        title, description, price_per_night, location_city, location_country, 
        category_id, images || [], hostId, max_guests || 1, bedrooms || 1, 
        beds || 1, bathrooms || 1, JSON.stringify(amenities || []), 
        JSON.stringify(rules || []), latitude || null, longitude || null, 
        address || null, getting_around || null
      ]
    );

    return newListing.rows[0];
  }

  static async updateListing(id, hostId, data) {
    const listing = await db.query('SELECT host_id FROM listings WHERE id = $1', [id]);

    if (listing.rows.length === 0) {
      throw new Error('NOT_FOUND');
    }

    if (listing.rows[0].host_id !== hostId) {
      throw new Error('FORBIDDEN');
    }

    const { 
      title, description, price_per_night, location_city, location_country, 
      category_id, images, max_guests, bedrooms, beds, bathrooms, 
      amenities, rules, latitude, longitude, address, getting_around 
    } = data;

    const updatedListing = await db.query(
      `UPDATE listings 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price_per_night = COALESCE($3, price_per_night),
           location_city = COALESCE($4, location_city),
           location_country = COALESCE($5, location_country),
           category_id = COALESCE($6, category_id),
           images = COALESCE($7, images),
           max_guests = COALESCE($8, max_guests),
           bedrooms = COALESCE($9, bedrooms),
           beds = COALESCE($10, beds),
           bathrooms = COALESCE($11, bathrooms),
           amenities = COALESCE($12, amenities),
           rules = COALESCE($13, rules),
           latitude = COALESCE($14, latitude),
           longitude = COALESCE($15, longitude),
           address = COALESCE($16, address),
           getting_around = COALESCE($17, getting_around)
       WHERE id = $18
       RETURNING *`,
      [
        title, description, price_per_night, location_city, location_country, 
        category_id, images, max_guests, bedrooms, beds, bathrooms, 
        amenities ? JSON.stringify(amenities) : null, 
        rules ? JSON.stringify(rules) : null, 
        latitude, longitude, address, getting_around, id
      ]
    );

    return updatedListing.rows[0];
  }

  static async deleteListing(id, hostId) {
    const listing = await db.query('SELECT host_id FROM listings WHERE id = $1', [id]);

    if (listing.rows.length === 0) {
      throw new Error('NOT_FOUND');
    }

    if (listing.rows[0].host_id !== hostId) {
      throw new Error('FORBIDDEN');
    }

    await db.query('DELETE FROM listings WHERE id = $1', [id]);
    return true;
  }

  static async getPopularDestinations() {
    const result = await db.query(
      `SELECT DISTINCT location_city, location_country 
       FROM listings 
       LIMIT 6`
    );
    return result.rows;
  }
}

module.exports = ListingService;