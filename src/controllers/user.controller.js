const UserService = require('../services/user.service');

const getListings = async (req, res) => {
  try {
    const { category_id } = req.query;
    const listings = await UserService.getUserListings(category_id);

    res.status(200).json(listings);
  } catch (error) {
    console.error('Ошибка при получении объявлений пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Ошибка при получении профиля пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  getListings,
  getUserProfile
};