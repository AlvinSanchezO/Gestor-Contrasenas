// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const defineUser = require('../models/User');
const sequelize = require('../config/database');

// Inicializamos el modelo
const User = defineUser(sequelize);

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validar que vengan los datos
        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan datos: email y password son obligatorios' });
        }

        // 2. Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // 3. Encriptar la contraseña (Hashing)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Guardar en la Base de Datos
        // CORRECCIÓN AQUÍ: Usamos los nombres exactos del modelo User.js
        const newUser = await User.create({
            email: email,
            master_hash: passwordHash, // Antes decía password_hash
            kdf_salt: salt             // Antes decía salt
        });

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            userId: newUser.id 
        });

    } catch (error) {
        console.error("Error en registro:", error); // Esto nos ayuda a ver errores futuros
        res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
    }
};

module.exports = { register };