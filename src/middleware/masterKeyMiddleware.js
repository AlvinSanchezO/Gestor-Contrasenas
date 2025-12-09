// src/middleware/masterKeyMiddleware.js
const crypto = require('crypto');
const { User } = require('../models');

/**
 * Middleware para validar la Clave Maestra
 * Valida que el header x-secret-key coincida con el hash almacenado
 */
const validateMasterKey = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userMasterKeyRaw = req.headers['x-secret-key'];

        // 1. Verificar que se envió la Clave Maestra
        if (!userMasterKeyRaw) {
            console.log(`[MasterKey] ⚠️ Falta x-secret-key para usuario ${userId}`);
            return res.status(400).json({ error: 'La Clave Maestra es obligatoria (header: x-secret-key)' });
        }

        // 2. Obtener el usuario
        const user = await User.findByPk(userId);
        if (!user) {
            console.log(`[MasterKey] ⛔ Usuario ${userId} no encontrado`);
            return res.status(401).json({ error: 'Usuario no autorizado' });
        }

        // 3. Validar que la Clave Maestra es correcta
        const providedMasterKeyHash = crypto.createHash('sha256').update(userMasterKeyRaw).digest('hex');
        
        if (providedMasterKeyHash !== user.master_key_hash) {
            console.log(`[MasterKey] ❌ Clave Maestra incorrecta para usuario ${userId}`);
            return res.status(401).json({ error: 'Clave Maestra incorrecta' });
        }

        console.log(`[MasterKey] ✅ Clave Maestra válida para usuario ${userId}`);
        
        // 4. Pasar la Clave Maestra al siguiente middleware/controlador
        req.masterKey = userMasterKeyRaw;
        next();

    } catch (error) {
        console.error('[MasterKey] ❌ Error al validar Clave Maestra:', error.message);
        res.status(500).json({ error: 'Error al validar Clave Maestra' });
    }
};

module.exports = validateMasterKey;
