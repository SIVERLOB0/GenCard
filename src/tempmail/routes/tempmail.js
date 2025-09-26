// FILE: ./src/tempmail/routes/tempmail.js
const express = require('express');
const router = express.Router();
const { tempmailHome } = require('../controllers/tempmailController');

router.get('/', tempmailHome);

module.exports = router;