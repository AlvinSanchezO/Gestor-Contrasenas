// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Buscar el token en la cabecera (Header)
    // El formato estándar es: "Bearer <token_aqui>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ error: 'Acceso denegado: No se proporcionó un token' });
    }

    // 2. Limpiar el prefijo "Bearer " para obtener solo el código
    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ error: 'Formato de token inválido' });
    }

    try {
        // 3. Verificar si el token es real y no ha expirado
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. ¡Token válido! Guardamos los datos del usuario en la petición
        // Así los siguientes controladores sabrán quién es el usuario.
        req.user = decoded; 
        
        // 5. Dejar pasar al siguiente paso (Controller)
        next();

    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = verifyToken;