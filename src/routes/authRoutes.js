// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definimos el endpoint: POST /auth/register
router.post('/register', authController.register);

module.exports = router;