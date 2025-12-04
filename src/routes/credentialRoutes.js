// src/routes/credentialRoutes.js
const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const verifyToken = require('../middleware/authMiddleware');

// --- PROTECCIÓN GLOBAL ---
// Todas las rutas escritas aquí abajo requieren Token válido
router.use(verifyToken);

// 1. Guardar nueva credencial (POST /api/credentials)
router.post('/', credentialController.createCredential);

// 2. Obtener todas las credenciales (GET /api/credentials)
router.get('/', credentialController.getAllCredentials);

module.exports = router;