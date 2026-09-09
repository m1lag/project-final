const db = require('../config/db');

class BookingService {
  static async checkOverlap(listingId, checkIn, checkOut) {
    const result = await db.query(
      `SELECT id FROM bookings 
       WHERE listing_id = $1 
         AND status != 'cancelled'
         AND (check_in, check_out) OVERLAPS ($2::date, $3::date)`,
      [listingId, checkIn, checkOut]
    );
    return result.rows.length > 0;
  }

  static async createBooking(data, userId) {
    const { listing_id, check_in, check_out, total_price } = data;

    const hasOverlap = await this.checkOverlap(listing_id, check_in, check_out);
    if (hasOverlap) {
      throw new Error('Выбранные даты уже забронированы');
    }

    const result = await db.query(
      `INSERT INTO bookings (user_id, listing_id, check_in, check_out, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, listing_id, check_in, check_out, total_price]
    );

    return result.rows[0];
  }

  static async getUserBookings(userId) {
    const result = await db.query(
      `SELECT b.*, l.title, l.location_city, l.images, l.price_per_night 
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getOccupiedDates(listingId) {
    const result = await db.query(
      `SELECT check_in, check_out FROM bookings 
       WHERE listing_id = $1 AND status != 'cancelled'`,
      [listingId]
    );
    return result.rows;
  }
}

module.exports = BookingService;