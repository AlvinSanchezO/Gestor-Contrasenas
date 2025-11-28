// src/utils/encryption.js
const crypto = require('node:crypto');

// ALGORITMO: AES-256-GCM
// GCM es vital porque incluye un "Sello de Integridad" (Auth Tag).
// Si alguien manipula la base de datos, el sello se rompe y el descifrado falla.
const ALGORITHM = 'aes-256-gcm';

/**
 * Función para CIFRAR un texto.
 * @param {string} text - El dato real (ej: "contraseña123")
 * @param {Buffer} masterKey - La llave de 32 bytes derivada de la contraseña maestra
 */
const encrypt = (text, masterKey) => {
    try {
        // 1. Generar Vector de Inicialización (IV) único (12 bytes es el estándar GCM)
        const iv = crypto.randomBytes(12);

        // 2. Crear el cifrador
        const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

        // 3. Cifrar el texto
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // 4. Obtener el Auth Tag (El sello de seguridad)
        const authTag = cipher.getAuthTag().toString('hex');

        // Retornamos todo lo necesario para guardar en la BD
        return {
            content: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag
        };
    } catch (error) {
        console.error("Error al cifrar:", error.message);
        throw new Error("Fallo en el proceso de cifrado");
    }
};

/**
 * Función para DESCIFRAR un texto.
 * @param {object} encryptedData - Objeto {content, iv, authTag}
 * @param {Buffer} masterKey - La misma llave usada para cifrar
 */
const decrypt = (encryptedData, masterKey) => {
    try {
        // 1. Reconstruir buffers desde Hex
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');

        // 2. Crear el descifrador
        const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
        
        // 3. ¡CRÍTICO! Establecer el sello de garantía antes de descifrar
        decipher.setAuthTag(authTag);

        // 4. Descifrar
        let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        // Si la clave maestra es incorrecta o los datos fueron hackeados, entra aquí.
        console.error("Error de descifrado: Clave incorrecta o datos corruptos.");
        return null; 
    }
};

module.exports = { encrypt, decrypt };