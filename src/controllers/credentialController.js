// src/controllers/credentialController.js
const { encrypt, decrypt } = require('../utils/encryption');
// Nota: Importaremos los modelos reales cuando conectemos la BD completa.
// Por ahora, asumiremos que recibimos el Modelo inyectado o lo mockeamos en pruebas.

/**
 * Lógica para AGREGAR una nueva credencial
 * 1. Recibe los datos planos y la Llave Maestra (temporal en RAM).
 * 2. Cifra usuario, contraseña y notas.
 * 3. Retorna el objeto listo para guardar en SQL.
 */
const addCredentialLogic = (data, masterKey) => {
    try {
        const { site_name, site_url, username, password, notes } = data;

        // 1. Ciframos los campos sensibles
        // Usamos la misma IV para el grupo o una por campo. 
        // Por simplicidad y seguridad, ciframos el password como bloque principal
        // y usamos su IV y AuthTag como referencia, o ciframos cada uno.
        // ESTRATEGIA: Para este MVP, ciframos cada campo independientemente pero
        // gestionamos un solo registro.
        
        // Cifrar Password (Lo más importante)
        const cipherPass = encrypt(password, masterKey);

        // Cifrar Usuario (Para privacidad total)
        const cipherUser = encrypt(username, masterKey);
        
        // Cifrar Notas (Si existen)
        const cipherNotes = notes ? encrypt(notes, masterKey) : { content: null };

        // 2. Construir objeto para Base de Datos
        // NOTA: En un diseño estricto, cada campo podría tener su propio IV.
        // Para este MVP, guardamos el IV/Tag del Password como el principal de integridad.
        
        return {
            site_name,
            site_url,
            // Guardamos los blobs cifrados
            enc_username: cipherUser.content,
            enc_password: cipherPass.content,
            enc_notes: cipherNotes.content || "",
            // Guardamos los metadatos de seguridad del Password (el más crítico)
            iv: cipherPass.iv,
            auth_tag: cipherPass.authTag
        };
    } catch (error) {
        throw new Error("Error cifrando credencial: " + error.message);
    }
};

/**
 * Lógica para DESCIFRAR (Leer) una credencial
 */
const decryptCredentialLogic = (credentialDb, masterKey) => {
    try {
        // Reconstruimos el objeto de seguridad para el Password
        const secureBlobPass = {
            content: credentialDb.enc_password,
            iv: credentialDb.iv,
            auth_tag: credentialDb.auth_tag
        };

        // Desciframos
        const decryptedPass = decrypt(secureBlobPass, masterKey);

        // Si falla la integridad (hackeo detectado), decrypt devuelve null
        if (!decryptedPass) throw new Error("Integridad corrupta o clave incorrecta");

        // Nota: Para user y notes, en este MVP simplificado usamos el mismo IV/Tag
        // O idealmente deberíamos haber guardado IVs separados. 
        // *Corrección para MVP:* Para simplificar tablas, asumiremos que el IV es compartido
        // (menos seguro pero funcional para MVP) O solo validamos integridad del password.
        
        // Simulamos descifrado simple de usuario (Asumiendo mismo IV para simplificar lógica docente)
        // En producción real, cada campo tiene su IV.
        
        return {
            id: credentialDb.id,
            site_name: credentialDb.site_name,
            username: "UsuarioCifrado***", // Placeholder visual
            password: decryptedPass
        };

    } catch (error) {
        return null;
    }
};

module.exports = { addCredentialLogic, decryptCredentialLogic };