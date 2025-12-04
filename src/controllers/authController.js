// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const defineUser = require('../models/User');
const sequelize = require('../config/database');

const User = defineUser(sequelize);

// 1. REGISTRO
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan datos: email y password son obligatorios' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

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

// 2. LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son obligatorios' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.master_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        res.json({ 
            message: 'Login exitoso',
            token: token 
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
};

// 3. LOGOUT (NUEVO)
const logout = (req, res) => {
    // En JWT, el servidor no necesita borrar nada de la BD.
    // Solo le confirmamos al cliente que puede borrar su token.
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
};

module.exports = { register, login, logout };