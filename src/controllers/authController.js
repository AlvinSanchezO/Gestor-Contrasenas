// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Importante para generar el token
const defineUser = require('../models/User');
const sequelize = require('../config/database');

// Inicializamos el modelo
const User = defineUser(sequelize);

// --- 1. FUNCIÓN DE REGISTRO ---
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar datos de entrada
        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan datos: email y password son obligatorios' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Guardar en Base de Datos (Usando los nombres correctos de las columnas)
        const newUser = await User.create({
            email: email,
            master_hash: passwordHash,
            kdf_salt: salt
        });

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            userId: newUser.id 
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
    }
};

// --- 2. FUNCIÓN DE LOGIN (NUEVA) ---
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que vengan los datos
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son obligatorios' });
        }

        // A. Buscar al usuario en la BD
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // B. Comparar contraseña (Texto plano vs Hash guardado)
        const validPassword = await bcrypt.compare(password, user.master_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // C. Generar el Token (JWT)
        // Guardamos el ID del usuario en el token para identificarlo después
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // Responder con el token
        res.json({ 
            message: 'Login exitoso',
            token: token 
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
};

// Exportamos ambas funciones
module.exports = { register, login };