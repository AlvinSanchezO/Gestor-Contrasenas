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
        throw new Error("Error cifrando: " + error.message);
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
                iv: credentialDb.iv, // Reusamos IV por simplicidad en este diseño MVP
                authTag: credentialDb.auth_tag 
            };
            // Nota: En un diseño prod, cada campo debería tener su IV/Tag, 
            // pero para este MVP asumimos que 'enc_username' se puede leer o devolvemos el blob.
            // Para simplificar y evitar errores de IV reusado en la desencriptación estricta,
            // en este paso del tutorial devolveremos el username cifrado visualmente
            // O, si usamos el mismo IV/Tag del insert, intentamos descifrar:
             const tryUser = decrypt(secureBlobUser, masterKey);
             if(tryUser) decryptedUser = tryUser;
        }

        return {
            id: credentialDb.id,
            site_name: credentialDb.site_name,
            site_url: credentialDb.site_url,
            username: decryptedUser, 
            password: decryptedPass, // ¡Aquí está la contraseña real!
            notes: "Nota cifrada" // Simplificación para el ejercicio
        };
    } catch (error) {
        return null;
    }
}

// --- CONTROLADORES EXPORTABLES ---

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

// 2. Obtener Todas (GET) - ¡NUEVO!
const getAllCredentials = async (req, res) => {
    try {
        const userId = req.user.id;
        const userKeyRaw = req.headers['x-secret-key'];

        if (!userKeyRaw) {
            return res.status(400).json({ error: 'Falta x-secret-key para descifrar tu bóveda' });
        }

        const masterKey = deriveKey(userKeyRaw);

        // 1. Buscar todo lo de este usuario
        const credentials = await Credential.findAll({ where: { user_id: userId } });

        // 2. Descifrar una por una
        const decryptedList = credentials.map(cred => {
            return decryptCredentialLogic(cred, masterKey);
        }).filter(cred => cred !== null); // Quitar las que no se pudieron descifrar

        res.json(decryptedList);

    } catch (error) {
        console.error("Error leyendo bóveda:", error);
        res.status(500).json({ error: 'Error al leer la bóveda' });
    }
};

module.exports = { 
    createCredential, 
    getAllCredentials 
};