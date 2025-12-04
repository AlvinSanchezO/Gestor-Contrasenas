// src/controllers/credentialController.js
const crypto = require('node:crypto');
const { encrypt, decrypt } = require('../utils/encryption');
const defineCredential = require('../models/Credential');
const sequelize = require('../config/database');

// Inicializar el modelo
const Credential = defineCredential(sequelize);

// --- UTILIDAD: Generar llave de 32 bytes desde un texto ---
function deriveKey(password) {
    return crypto.createHash('sha256').update(password).digest();
}

// --- LÓGICA DE NEGOCIO (Cifrado/Descifrado) ---

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
        // 1. Descifrar Password
        const secureBlobPass = {
            content: credentialDb.enc_password,
            iv: credentialDb.iv,
            authTag: credentialDb.auth_tag
        };
        const decryptedPass = decrypt(secureBlobPass, masterKey);
        if (!decryptedPass) return null; // Si falla la firma, ignoramos este registro

        // 2. Descifrar Usuario (si existe)
        let decryptedUser = credentialDb.enc_username;
        if (credentialDb.enc_username) {
             const secureBlobUser = {
                content: credentialDb.enc_username,
                iv: credentialDb.iv, // Reusamos IV por simplicidad en este MVP
                authTag: credentialDb.auth_tag 
            };
             const tryUser = decrypt(secureBlobUser, masterKey);
             if(tryUser) decryptedUser = tryUser;
        }

        return {
            id: credentialDb.id,
            site_name: credentialDb.site_name,
            site_url: credentialDb.site_url,
            username: decryptedUser, 
            password: decryptedPass, 
            notes: "Nota cifrada" 
        };
    } catch (error) {
        return null;
    }
}

// --- CONTROLADORES EXPRESS ---

// 1. Guardar nueva credencial (POST)
const createCredential = async (req, res) => {
    try {
        const userId = req.user.id;
        const { site_name, site_url, username, password, notes } = req.body;
        
        // Obtener clave maestra del header
        const userKeyRaw = req.headers['x-secret-key'];
        if (!userKeyRaw) {
            return res.status(400).json({ error: 'Falta la cabecera "x-secret-key" para cifrar' });
        }
        
        const masterKey = deriveKey(userKeyRaw);

        // Cifrar datos
        const encryptedData = addCredentialLogic(
            { site_name, site_url, username, password, notes }, 
            masterKey
        );

        // Guardar en BD
        const newCredential = await Credential.create({
            user_id: userId,
            ...encryptedData
        });

        res.status(201).json({ 
            message: 'Credencial cifrada y guardada exitosamente', 
            id: newCredential.id 
        });

    } catch (error) {
        console.error("Error guardando:", error);
        res.status(500).json({ error: 'Error al guardar la credencial' });
    }
};

// 2. Obtener todas las credenciales (GET)
const getAllCredentials = async (req, res) => {
    try {
        const userId = req.user.id;
        const userKeyRaw = req.headers['x-secret-key'];

        if (!userKeyRaw) {
            return res.status(400).json({ error: 'Falta x-secret-key para descifrar tu bóveda' });
        }

        const masterKey = deriveKey(userKeyRaw);

        // Buscar en BD
        const credentials = await Credential.findAll({ where: { user_id: userId } });

        // Descifrar lista
        const decryptedList = credentials.map(cred => {
            return decryptCredentialLogic(cred, masterKey);
        }).filter(cred => cred !== null);

        res.json(decryptedList);

    } catch (error) {
        console.error("Error leyendo bóveda:", error);
        res.status(500).json({ error: 'Error al leer la bóveda' });
    }
};

// 3. Eliminar Credencial (DELETE)
const deleteCredential = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verificar que la credencial exista y pertenezca al usuario
        const credential = await Credential.findOne({ 
            where: { id: id, user_id: userId } 
        });

        if (!credential) {
            return res.status(404).json({ error: 'Credencial no encontrada o no tienes permiso' });
        }

        // Eliminar
        await credential.destroy();

        res.json({ message: 'Credencial eliminada correctamente' });

    } catch (error) {
        console.error("Error eliminando:", error);
        res.status(500).json({ error: 'Error al eliminar la credencial' });
    }
};

module.exports = { 
    createCredential, 
    getAllCredentials,
    deleteCredential 
};