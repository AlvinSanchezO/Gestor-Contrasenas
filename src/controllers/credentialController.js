// src/controllers/credentialController.js
const crypto = require('node:crypto');
const { encrypt, decrypt } = require('../utils/encryption');
const { Credential } = require('../models');

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

        // Descifrar Notas
        let decryptedNotes = "";
        if (credentialDb.enc_notes && credentialDb.enc_notes.trim()) {
            const secureBlobNotes = {
                content: credentialDb.enc_notes,
                iv: credentialDb.iv,
                authTag: credentialDb.auth_tag
            };
            const tryNotes = decrypt(secureBlobNotes, masterKey);
            if (tryNotes) decryptedNotes = tryNotes;
        }

        return {
            id: credentialDb.id,
            site_name: credentialDb.site_name,
            site_url: credentialDb.site_url,
            username: decryptedUser, 
            password: decryptedPass, 
            notes: decryptedNotes
        };
    } catch (error) {
        console.error('[Decrypt] Error descifando credencial:', error.message);
        return null;
    }
}

// --- CONTROLADORES ---

// 1. Guardar (POST)
const createCredential = async (req, res) => {
    try {
        const userId = req.user.id;
        const userKeyRaw = req.masterKey; // Viene del middleware validateMasterKey
        const { site_name, site_url, username, password, notes } = req.body;
        
        console.log(`[Credentials] 📝 Solicitud de crear credencial para usuario ${userId}`);
        console.log(`[Credentials] Sitio: ${site_name}`);
        
        const masterKey = deriveKey(userKeyRaw);

        const encryptedData = addCredentialLogic(
            { site_name, site_url, username, password, notes }, 
            masterKey
        );

        const newCredential = await Credential.create({
            user_id: userId,
            ...encryptedData
        });

        console.log(`[Credentials] ✅ Credencial creada exitosamente. ID: ${newCredential.id}`);
        res.status(201).json({ 
            message: 'Credencial guardada exitosamente', 
            id: newCredential.id,
            site_name: newCredential.site_name
        });
    } catch (error) {
        console.error(`[Credentials] ❌ Error al crear credencial:`, error.message);
        res.status(500).json({ error: 'Error guardando credencial' });
    }
};

// 2. Obtener Todas (GET)
const getAllCredentials = async (req, res) => {
    try {
        const userId = req.user.id;
        const userKeyRaw = req.masterKey; // Viene del middleware validateMasterKey

        console.log(`[Credentials] 📋 Solicitud de obtener credenciales para usuario ${userId}`);

        const masterKey = deriveKey(userKeyRaw);

        const credentials = await Credential.findAll({ where: { user_id: userId } });

        console.log(`[Credentials] ✅ Se encontraron ${credentials.length} credenciales`);

        const decryptedList = credentials.map(cred => {
            return decryptCredentialLogic(cred, masterKey);
        }).filter(cred => cred !== null);

        res.json(decryptedList);
    } catch (error) {
        console.error(`[Credentials] ❌ Error al obtener credenciales:`, error.message);
        res.status(500).json({ error: 'Error leyendo bóveda' });
    }
};

// 3. Eliminar (DELETE)
const deleteCredential = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        console.log(`[Credentials] 🗑️ Solicitud de eliminar credencial ID: ${id} para usuario ${userId}`);

        const credential = await Credential.findOne({
            where: { id: id, user_id: userId } 
        });

        if (!credential) {
            console.log(`[Credentials] ❌ Credencial no encontrada. ID: ${id}`);
            return res.status(404).json({ error: 'Credencial no encontrada' });
        }

        await credential.destroy();
        
        console.log(`[Credentials] ✅ Credencial eliminada correctamente. ID: ${id}`);
        res.json({ message: 'Credencial eliminada exitosamente' });
    } catch (error) {
        console.error(`[Credentials] ❌ Error eliminando credencial:`, error.message);
        res.status(500).json({ error: 'Error al eliminar la credencial' });
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