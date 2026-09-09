module.exports = (err, req, res, next) => {
  console.error('Ошибка приложения:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    error: message
  });
};