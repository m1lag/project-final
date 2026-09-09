const db = require('../config/db');

class PaymentService {
  static async processBookingPayment({ bookingId, userId, amount, paymentMethod = 'card', cardDetails }) {
    const bookingResult = await db.query(
      'SELECT id, user_id, total_price, payment_status FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (bookingResult.rows[0].user_id !== userId) {
      throw new Error('FORBIDDEN');
    }

    const transactionId = `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const updatedBooking = await db.query(
      `UPDATE bookings 
       SET payment_status = 'paid', 
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, payment_status, total_price`,
      [bookingId]
    );

    return {
      transactionId,
      status: 'success',
      booking: updatedBooking.rows[0],
      amountPaid: amount
    };
  }
}

module.exports = PaymentService;