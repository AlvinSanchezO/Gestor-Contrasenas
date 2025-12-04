// src/routes/credentialRoutes.js
const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const verifyToken = require('../middleware/authMiddleware');

// --- PROTECCIÓN GLOBAL ---
// El "Guardia" se activa aquí. Todas las rutas de abajo requieren Token válido.
router.use(verifyToken);

// 1. Guardar nueva credencial (POST /api/credentials)
router.post('/', credentialController.createCredential);

// 2. Obtener todas las credenciales (GET /api/credentials)
router.get('/', credentialController.getAllCredentials);

// 3. Actualizar una credencial (PUT /api/credentials/:id) - ¡NUEVO!
router.put('/:id', credentialController.updateCredential);

// 4. Eliminar credencial por ID (DELETE /api/credentials/:id)
router.delete('/:id', credentialController.deleteCredential);

module.exports = router;