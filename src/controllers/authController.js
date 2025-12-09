const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');

// 1. REGISTRO
const register = async (req, res) => {
    try {
        const { email, password, masterKey } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan datos: email y password son obligatorios' });
        }

        if (!masterKey) {
            return res.status(400).json({ error: 'La Clave Maestra es obligatoria' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        if (masterKey.length < 6) {
            return res.status(400).json({ error: 'La Clave Maestra debe tener al menos 6 caracteres' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log(`[Backend] Intento de registro fallido: ${email} ya existe.`);
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // --- CONTRASEÑA DE LOGIN ---
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // --- CLAVE MAESTRA PARA CIFRADO (independiente) ---
        const encryptionSalt = crypto.randomBytes(32).toString('hex');
        
        // --- HASH DE VALIDACIÓN DE CLAVE MAESTRA ---
        const masterKeyHash = crypto.createHash('sha256').update(masterKey).digest('hex');

        const newUser = await User.create({
            email: email,
            master_hash: passwordHash,
            encryption_salt: encryptionSalt,
            master_key_hash: masterKeyHash,
            kdf_salt: salt  // Legacy, mantenemos para compatibilidad
        });

        console.log(`[Backend] ✅ Nuevo usuario registrado: ${email}`);
        console.log(`[Backend] 🔐 Clave Maestra configurada para cifrado de credenciales`);

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            userId: newUser.id,
            hint: 'Recuerda tu Clave Maestra. La necesitarás para acceder a tus credenciales.'
        });

    } catch (error) {
        console.error("[Backend] ❌ Error en registro:", error);
        res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
    }
};

// 2. LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔹 LOG: Intento de inicio
        console.log(`[Backend] 📩 Recibida solicitud de login para: ${email || 'sin email'}`);

        if (!email || !password) {
            console.log(`[Backend] ⚠️ Login rechazado: Faltan credenciales.`);
            return res.status(400).json({ error: 'Email y password son obligatorios' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`[Backend] ⛔ Login fallido: Usuario no encontrado (${email}).`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.master_hash);
        if (!validPassword) {
            console.log(`[Backend] ⛔ Login fallido: Contraseña incorrecta para ${email}.`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        // 🔹 LOG: Éxito
        console.log(`[Backend] ✅ Login EXITOSO para: ${email}`);

        res.json({ 
            message: 'Login exitoso',
            token: token 
        });

    } catch (error) {
        console.error("[Backend] ❌ Error crítico en login:", error);
        res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
};

// 3. LOGOUT
const logout = (req, res) => {
    console.log(`[Backend] 👋 Logout solicitado.`);
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
};

module.exports = { register, login, logout };