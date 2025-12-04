// src/routes/credentialRoutes.js
const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const verifyToken = require('../middleware/authMiddleware');

// PROTECCIÓN GLOBAL: Todas las rutas aquí requieren Token
router.use(verifyToken);

// POST /api/credentials -> Guardar nueva cuenta
router.post('/', credentialController.createCredential);

module.exports = router;