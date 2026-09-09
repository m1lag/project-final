const ExperiencesService = require('../services/experiences.service');

const getExperiences = async (req, res) => {
  try {
    const experiences = await ExperiencesService.getAllExperiences();
    res.status(200).json(experiences);
  } catch (error) {
    console.error('Ошибка при получении впечатлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  getExperiences
};