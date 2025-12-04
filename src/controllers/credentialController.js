// src/controllers/credentialController.js
const crypto = require('node:crypto');
const { encrypt, decrypt } = require('../utils/encryption');
const defineCredential = require('../models/Credential');
const sequelize = require('../config/database');

// Inicializar el modelo
const Credential = defineCredential(sequelize);

// --- UTILIDAD: Generar llave de 32 bytes desde un texto ---
// Esto permite que el usuario envíe "MiSecreto" y lo convirtamos en una llave válida para AES
function deriveKey(password) {
    return crypto.createHash('sha256').update(password).digest();
}

// --- 1. LÓGICA PURA (Ya la tenías) ---
function addCredentialLogic(data, masterKey) {
    try {
        const { site_name, site_url, username, password, notes } = data;
        
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

function decryptCredentialLogic(credentialDb, masterKey) {
    try {
        const secureBlobPass = {
            content: credentialDb.enc_password,
            iv: credentialDb.iv,
            authTag: credentialDb.auth_tag
        };
        const decryptedPass = decrypt(secureBlobPass, masterKey);
        if (!decryptedPass) throw new Error("Integridad corrupta o clave incorrecta");

        // También desciframos el usuario (opcional, pero recomendado)
        // Por simplicidad en este MVP, retornamos el pass descifrado
        return {
            id: credentialDb.id,
            site_name: credentialDb.site_name,
            username: "UsuarioCifrado", // Podrías descifrarlo también si quisieras
            password: decryptedPass
        };
    } catch (error) {
        return null;
    }
}

// --- 2. CONTROLADORES EXPRESS (Nuevos) ---

const createCredential = async (req, res) => {
    try {
        // A. Obtener datos
        const userId = req.user.id; // Viene del Token (Middleware)
        const { site_name, site_url, username, password, notes } = req.body;
        
        // B. Obtener la Clave Maestra del Header
        // El usuario debe enviar un header "x-secret-key" para cifrar sus datos
        const userKeyRaw = req.headers['x-secret-key'];
        
        if (!userKeyRaw) {
            return res.status(400).json({ error: 'Falta la cabecera "x-secret-key" para cifrar' });
        }
        
        const masterKey = deriveKey(userKeyRaw); // Convertimos texto a 32 bytes

        // C. Cifrar los datos (Usando tu lógica existente)
        const encryptedData = addCredentialLogic(
            { site_name, site_url, username, password, notes }, 
            masterKey
        );

        // D. Guardar en Base de Datos
        const newCredential = await Credential.create({
            user_id: userId,
            ...encryptedData
        });

        res.status(201).json({ 
            message: 'Credencial cifrada y guardada exitosamente', 
            id: newCredential.id 
        });

    } catch (error) {
        console.error("Error guardando credencial:", error);
        res.status(500).json({ error: 'Error al guardar la credencial' });
    }
};

module.exports = { 
    addCredentialLogic, 
    decryptCredentialLogic,
    createCredential // Exportamos la nueva función
};