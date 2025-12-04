// server.js
require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const app = express();
const port = 3000;

// --- IMPORTACIONES ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger.js');

// Rutas
const authRoutes = require('./src/routes/authRoutes');
const credentialRoutes = require('./src/routes/credentialRoutes'); // <--- NUEVA RUTA

// Middleware de seguridad (Guardia)
const verifyToken = require('./src/middleware/authMiddleware');

// --- MIDDLEWARES GLOBALES ---
app.use(express.json()); // Habilitar JSON

// --- DOCUMENTACIÓN SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- RUTAS DE LA API ---

// 1. Autenticación (Públicas: Login y Registro)
app.use('/api/auth', authRoutes);

// 2. Credenciales / Bóveda (Privadas: Requieren Token)
// Todas las rutas dentro de credentialRoutes pasarán primero por verifyToken
app.use('/api/credentials', credentialRoutes);

// --- RUTA DE PRUEBA DE SEGURIDAD (Opcional, la puedes dejar para probar) ---
app.get('/api/test-protegido', verifyToken, (req, res) => {
    res.json({ 
        message: '¡Felicidades! Entraste a la zona VIP.', 
        usuario: req.user 
    });
});

// --- RUTA BASE (Health Check) ---
app.get('/', (req, res) => {
  res.send('¡Servidor del Gestor de Contraseñas funcionando!');
});

// --- INICIAR SERVIDOR ---
app.listen(port, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📄 Documentación disponible en http://localhost:${port}/api-docs`);
});