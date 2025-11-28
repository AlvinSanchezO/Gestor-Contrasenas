// src/controllers/authController.js
const argon2 = require('argon2');
const crypto = require('node:crypto');

// Configuración de seguridad para Argon2 (Estándar OWASP)
const ARGON_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB de memoria
    timeCost: 3,         // 3 iteraciones
    parallelism: 1       // 1 hilo
};

/**
 * Lógica para REGISTRAR un nuevo usuario
 * Genera el hash y la salt necesaria para el cifrado futuro.
 */
const registerLogic = async (email, masterPassword) => {
    try {
        // 1. Generar una SALT aleatoria para el usuario (se usará para cifrar datos después)
        // Convertimos a Hex para guardarlo fácil en SQL
        const kdfSalt = crypto.randomBytes(32).toString('hex');

        // 2. Hashear la contraseña maestra
        const hash = await argon2.hash(masterPassword, ARGON_CONFIG);

        // Retornamos el objeto listo para guardarse en la BD
        return {
            email: email,
            master_hash: hash,
            kdf_salt: kdfSalt
        };
    } catch (error) {
        throw new Error("Error al procesar el registro: " + error.message);
    }
};

/**
 * Lógica para LOGIN
 * Verifica si la contraseña coincide con el hash.
 */
const loginLogic = async (inputPassword, storedHash) => {
    try {
        // argon2.verify devuelve true o false
        const isValid = await argon2.verify(storedHash, inputPassword);
        return isValid;
    } catch (error) {
        throw new Error("Error en verificación: " + error.message);
    }
};

module.exports = { registerLogic, loginLogic };