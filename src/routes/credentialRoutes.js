// src/routes/credentialRoutes.js
const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const verifyToken = require('../middleware/authMiddleware');
const validateMasterKey = require('../middleware/masterKeyMiddleware');

// --- PROTECCIÓN GLOBAL DE AUTENTICACIÓN ---
router.use(verifyToken);

// 1. Guardar nueva credencial (POST /api/credentials)
// Requiere Clave Maestra para cifrar
router.post('/', validateMasterKey, credentialController.createCredential);

// 2. Obtener todas las credenciales (GET /api/credentials)
// Requiere Clave Maestra para descifrar
router.get('/', validateMasterKey, credentialController.getAllCredentials);

// 3. Actualizar una credencial (PUT /api/credentials/:id)
// Requiere Clave Maestra para re-cifrar
router.put('/:id', validateMasterKey, credentialController.updateCredential);

// 4. Eliminar credencial por ID (DELETE /api/credentials/:id)
// NO requiere Clave Maestra - solo requiere token de autenticación
router.delete('/:id', credentialController.deleteCredential);

module.exports = router;