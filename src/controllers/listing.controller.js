const ListingService = require('../services/listing.service');

const getListings = async (req, res) => {
  try {
    const listings = await ListingService.getAllListings(req.query);
    res.json(listings);
  } catch (error) {
    console.error('Ошибка при получении объявлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await ListingService.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }
    res.json(listing);
  } catch (error) {
    console.error('Ошибка при получении объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const createListing = async (req, res) => {
  try {
    const { title, price_per_night, location_city, category_id } = req.body;

    if (!title || !price_per_night || !location_city || !category_id) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const newListing = await ListingService.createListing(req.body, req.user.id);
    res.status(201).json(newListing);
  } catch (error) {
    console.error('Ошибка при создании объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedListing = await ListingService.updateListing(id, req.user.id, req.body);
    res.json(updatedListing);
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'У вас нет прав на редактирование этого объявления' });
    }
    console.error('Ошибка при обновлении объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    await ListingService.deleteListing(id, req.user.id);
    res.json({ message: 'Объявление успешно удалено' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'У вас нет прав на удаление этого объявления' });
    }
    console.error('Ошибка при удалении объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getPopularDestinations = async (req, res) => {
  try {
    const destinations = await ListingService.getPopularDestinations();
    res.json(destinations);
  } catch (error) {
    console.error('Ошибка при получении популярных направлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { 
  getListings, 
  getListingById, 
  createListing,
  updateListing,
  deleteListing,
  getPopularDestinations
};