const BookingService = require('../services/booking.service');

const createBooking = async (req, res) => {
  try {
    const { listing_id, check_in, check_out, total_price } = req.body;

    if (!listing_id || !check_in || !check_out || !total_price) {
      return res.status(400).json({ error: 'Заполните все данные для бронирования' });
    }

    const booking = await BookingService.createBooking(req.body, req.user.id);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(400).json({ error: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await BookingService.getUserBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getOccupiedDates = async (req, res) => {
  try {
    const { listing_id } = req.params;
    const occupiedDates = await BookingService.getOccupiedDates(listing_id);
    res.json(occupiedDates);
  } catch (error) {
    console.error('Ошибка при получении занятых дат:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getOccupiedDates
};