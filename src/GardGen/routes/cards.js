const express = require('express');
const router = express.Router();
const { generateCards } = require('../controllers/cardsController');

router.get('/', generateCards);

module.exports = router;