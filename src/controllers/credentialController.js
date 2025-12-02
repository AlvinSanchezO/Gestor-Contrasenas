// src/controllers/credentialController.js
const { encrypt, decrypt } = require('../utils/encryption');

// --- 1. Definición con FUNCTION (Esto evita tu error) ---
function addCredentialLogic(data, masterKey) {
    try {
        const { site_name, site_url, username, password, notes } = data;

        // Cifrar datos
        const cipherPass = encrypt(password, masterKey);
        const cipherUser = encrypt(username, masterKey);
        const cipherNotes = notes ? encrypt(notes, masterKey) : { content: "" };

        return {
            site_name,
            site_url,
            enc_username: cipherUser.content,
            enc_password: cipherPass.content,
            enc_notes: cipherNotes.content || "",
            iv: cipherPass.iv,
            auth_tag: cipherPass.authTag 
        };
    } catch (error) {
        throw new Error("Error cifrando credencial: " + error.message);
    }
}

// --- 2. Definición con FUNCTION ---
function decryptCredentialLogic(credentialDb, masterKey) {
    try {
        // TRADUCCIÓN: La BD usa 'auth_tag' -> encryption.js pide 'authTag'
        const secureBlobPass = {
            content: credentialDb.enc_password,
            iv: credentialDb.iv,
            authTag: credentialDb.auth_tag 
        };

        const decryptedPass = decrypt(secureBlobPass, masterKey);

        if (!decryptedPass) throw new Error("Integridad corrupta o clave incorrecta");

        return {
            id: credentialDb.id,
            site_name: credentialDb.site_name,
            username: "UsuarioCifrado***", 
            password: decryptedPass
        };

    } catch (error) {
        return null;
    }
}

// --- 3. EXPORTAR AL FINAL ---
module.exports = { addCredentialLogic, decryptCredentialLogic };