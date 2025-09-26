// FILE: ./src/extraplorador/routes/extraplorador.js
const express = require('express');
const router = express.Router();
const { extraHome } = require('../controllers/extraploradorController');

router.get('/', extraHome);

module.exports = router;