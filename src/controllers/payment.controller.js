const PaymentService = require('../services/payment.service');

const processPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, card_details } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'Укажите ID бронирования и сумму оплаты' });
    }

    const paymentResult = await PaymentService.processBookingPayment({
      bookingId: booking_id,
      userId: req.user.id,
      amount,
      paymentMethod: payment_method,
      cardDetails: card_details
    });

    res.status(200).json({
      message: 'Оплата прошла успешно',
      ...paymentResult
    });
  } catch (error) {
    if (error.message === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'У вас нет доступа к этому бронированию' });
    }
    console.error('Ошибка при обработке платежа:', error);
    res.status(500).json({ error: 'Ошибка при проведении транзакции' });
  }
};

module.exports = {
  processPayment
};