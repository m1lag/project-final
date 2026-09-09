const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => res.json({ message: 'Map API is active' }));

module.exports = router;