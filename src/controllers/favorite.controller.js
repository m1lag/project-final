const FavoriteService = require('../services/favorite.service');

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Укажите listing_id' });
    }

    const favorite = await FavoriteService.addFavorite(userId, listing_id);

    res.status(201).json({
      message: 'Добавлено в избранное',
      favorite
    });
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await FavoriteService.getUserFavorites(userId);

    res.status(200).json(favorites);
  } catch (error) {
    console.error('Ошибка при получении избранного:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listing_id } = req.params;

    if (!listing_id) {
      return res.status(400).json({ error: 'Укажите listing_id' });
    }

    await FavoriteService.removeFavorite(userId, listing_id);

    res.status(200).json({ message: 'Удалено из избранного' });
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  addFavorite,
  getMyFavorites,
  removeFavorite
};