const express = require('express');
const router = express.Router();
const { getExperiences } = require('../controllers/experiences.controller');

router.get('/', getExperiences);

module.exports = router;