// src/controllers/credentialController.js
const crypto = require('node:crypto');
const { encrypt, decrypt } = require('../utils/encryption');
const defineCredential = require('../models/Credential');
const sequelize = require('../config/database');

const Credential = defineCredential(sequelize);

// --- UTILIDAD ---
function deriveKey(password) {
    return crypto.createHash('sha256').update(password).digest();
}

// --- LÓGICA DE NEGOCIO ---
function addCredentialLogic(data, masterKey) {
    try {
        const { site_name, site_url, username, password, notes } = data;
        
        // Ciframos todo de nuevo
        const cipherPass = encrypt(password, masterKey);
        const cipherUser = encrypt(username, masterKey);
        const cipherNotes = notes ? encrypt(notes, masterKey) : { content: "" };

        return {
            site_name,
            site_url,
            enc_username: cipherUser.content,
            enc_password: cipherPass.content,
            enc_notes: cipherNotes.content || "",
            iv: cipherPass.iv,        // Guardamos el IV de la contraseña
            auth_tag: cipherPass.authTag // Y su firma
        };
    } catch (error) {
        throw new Error("Error cifrando credencial: " + error.message);
    }
}

function decryptCredentialLogic(credentialDb, masterKey) {
    try {
        // Descifrar Password
        const secureBlobPass = {
            content: credentialDb.enc_password,
            iv: credentialDb.iv,
            authTag: credentialDb.auth_tag
        };
        const decryptedPass = decrypt(secureBlobPass, masterKey);
        if (!decryptedPass) return null; 

        // Descifrar Usuario
        let decryptedUser = credentialDb.enc_username;
        if (credentialDb.enc_username) {
             const secureBlobUser = {
                content: credentialDb.enc_username,
                iv: credentialDb.iv, 
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

// --- CONTROLADORES ---

// 1. Guardar (POST)
const createCredential = async (req, res) => {
    try {
        const userId = req.user.id;
        const { site_name, site_url, username, password, notes } = req.body;
        
        const userKeyRaw = req.headers['x-secret-key'];
        if (!userKeyRaw) return res.status(400).json({ error: 'Falta x-secret-key' });
        
        const masterKey = deriveKey(userKeyRaw);

        const encryptedData = addCredentialLogic(
            { site_name, site_url, username, password, notes }, 
            masterKey
        );

        const newCredential = await Credential.create({
            user_id: userId,
            ...encryptedData
        });

        res.status(201).json({ message: 'Guardado', id: newCredential.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error guardando' });
    }
};

// 2. Obtener Todas (GET)
const getAllCredentials = async (req, res) => {
    try {
        const userId = req.user.id;
        const userKeyRaw = req.headers['x-secret-key'];

        if (!userKeyRaw) return res.status(400).json({ error: 'Falta x-secret-key' });

        const masterKey = deriveKey(userKeyRaw);

        const credentials = await Credential.findAll({ where: { user_id: userId } });

        const decryptedList = credentials.map(cred => {
            return decryptCredentialLogic(cred, masterKey);
        }).filter(cred => cred !== null);

        res.json(decryptedList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error leyendo bóveda' });
    }
};

// 3. Eliminar (DELETE)
const deleteCredential = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const credential = await Credential.findOne({ 
            where: { id: id, user_id: userId } 
        });

        if (!credential) return res.status(404).json({ error: 'No encontrado' });

        await credential.destroy();
        res.json({ message: 'Credencial eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error eliminando' });
    }
};

// 4. Actualizar (PUT) - ¡NUEVO!
const updateCredential = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { site_name, site_url, username, password, notes } = req.body;

        // Necesitamos la llave para re-encriptar todo
        const userKeyRaw = req.headers['x-secret-key'];
        if (!userKeyRaw) return res.status(400).json({ error: 'Falta x-secret-key' });

        // Buscar la credencial
        const credential = await Credential.findOne({ 
            where: { id: id, user_id: userId } 
        });

        if (!credential) return res.status(404).json({ error: 'Credencial no encontrada' });

        // Generar la llave maestra
        const masterKey = deriveKey(userKeyRaw);

        // Cifrar los NUEVOS datos
        const encryptedData = addCredentialLogic(
            { site_name, site_url, username, password, notes }, 
            masterKey
        );

        // Actualizar en BD
        await credential.update(encryptedData);

        res.json({ message: 'Credencial actualizada correctamente' });

    } catch (error) {
        console.error("Error actualizando:", error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

module.exports = { 
    createCredential, 
    getAllCredentials,
    deleteCredential,
    updateCredential // <--- Exportado
};